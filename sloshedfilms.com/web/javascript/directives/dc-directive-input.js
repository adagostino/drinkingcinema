var name = "directive.input";
(function(name){
    var keys = {
        'ctrl':     17,
        'cmd':      91,
        'esc':      27,
        'shift':    16,
        'b':        66,
        'i':        73,
        'u':        85,
        '=':        187,
        'left':     37,
        'up':       38,
        'right':    39,
        'down':     40,
        'return':   13
    };
    // validators for the text -- return true or false, the scope (ie 'this') is the scope of the text input
    var _validators = {
        'required': {
            test: function(text) {
                // basically just check if it's a non-empty string
                return !!text.length;
            },
            msg: function(){
                return (this.name || "This") + " is required."
            }
        },
        'email': {
            test: function(text){
                return !!text.match(/^([a-z0-9\+_\-]+)(\.[a-z0-9\+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,6}$/i);
            },
            msg: "Please input a valid Email address."
        },
        'maxLength': {
            test: function(text, max){
                if (!max) return true; // if max isn't supplied, then it'll always work
                return text.length <= max;
            },
            msg: function(max){
                return (this.name || "This") + " exceeds the maximum length" + (max ? " of " + max + "characters" : "") + ".";
            }
        }
    };


    var input = function(){};

    input.prototype.setValidator = function(){
        if (!this.$el.attr("validators")) return;
        var validators = this.$el.attr("validators").split(","),
            reg = new RegExp('='),
            va = [],
            self = this;
        for (var i=0; i<validators.length; i++){
            var name = validators[i], input;
            if (reg.test(name)){
                var a = name.split("=");
                name = a[0];
                input = a[1];
            }
            (function(validator,input, name){
                validator && va.push(function(){
                    var text = $.trim(this.text());
                    return this.$call(validator.test, text, input) || (typeof validator.msg === "function" ? this.$call(validator.msg, input) : validator.msg);
                }.bind(self));
            })(_validators[name], input, name);
        };
        return va.length ? function(){
            var ea = [];
            for (var i=0; i<va.length; i++){
                var err = va[i]();
                typeof err === 'string' && ea.push(err);
            }
            return ea;
        } : undefined;
    };

    input.prototype.init = function(){
        this.model = this.$el.attr("input-model");
        this.name = this.$el.attr("name");
        this.placeholder = this.$el.attr("placeholder");

        var val = Path.get(this.model).getValueFrom(this) || "";
        this.$input = this.$el.find("[contenteditable]").html(val).attr("placeholder",this.$el.attr("placeholder"));

        this.isEmpty = !!!$.trim(val).length;
        this.hasFocus = false;
        this.isEditable = true;

        this.validate = this.setValidator();

        this.$watch(this.model,function(n, o){
            this.$input[this.isTextArea ? "val" : "html"]() !== n && this.$input[this.isTextArea ? "val" : "html"](n || "");
            this.isEmpty = !!!$.trim(n).length;
        });
        // watch parent scope
        this.validate && this.$watch("parentScope.isProcessing",function(n,o){
            this.isEditable = !n;
            if (n) {
                this.errors = this.validate();
                this.$call(this.onValidate);
            }

        });
    };

    input.prototype.text = function(){
        return this.isTextArea ? this.$input.val() : $dc.utils.getText(this.$input.html());
    };

    //Events:
    input.prototype.onFocus = function(e){
        this.hasFocus = true;
    };

    input.prototype.onBlur = function(e){
        this.hasFocus = false;
        var text = this.text();
        if (!$.trim(text).length) Path.get(this.model).setValueFrom(this,"");
        if (this.errors && this.errors.length) this.errors = this.validate();
    };

    input.prototype.onKeydown = function(e){
        switch(e.which){
            case keys["ctrl"]:
                this.ctrl = true;
                break;
            case keys["cmd"]:
                this.cmd = true;
                break;
            case keys["shift"]:
                this.shift = true;
                break;
            case keys["b"]:
                (this.ctrl || this.cmd) && e.preventDefault();
                break;
            case keys["i"]:
                (this.ctrl || this.cmd) && e.preventDefault();
                break;
            case keys["u"]:
                (this.ctrl || this.cmd) && e.preventDefault();
                break;
            case keys["return"]:
                !this.allowBreaks && e.preventDefault();
                break;
            default:
                break;
        }
    };

    input.prototype.onKeyup = function(e){
        switch(e.which){
            case keys["ctrl"]:
                this.ctrl = false;
                break;
            case keys["cmd"]:
                this.cmd = false;
                break;
            case keys["shift"]:
                this.shift = false;
                break;
            default:
                break;
        }
    };

    input.prototype.onPaste = function(e){
        this.pasted = true;
    };

    input.prototype.onInput = function(e){
        // if it was just pasted, get rid of all the html
        Path.get(this.model).setValueFrom(this, this.pasted ? this.text()  : this.$input[this.isTextArea ? "val" : "html"]());
        this.pasted = false;
    };

    $dc.addDirective({
        name: name,
        directive: input,
        template: "#dc-directive-input-template",
        $scope: {
            'onValidate': '&onValidate'
        }
    });

})(name);

var name = "directive.input.textArea";
(function(){
    var textArea = function(){};
    textArea.prototype.init = function(){
        this.isTextArea = true;
        this.allowBreaks = true;
        this._super();
        this.$timeout(function(){
           this.$input = this.$el.find("textarea");
        });
    };

    $dc.addDirective({
        name: name,
        directive: textArea,
        template: "#dc-directive-input-template",
        $scope: {
            'onValidate': '&onValidate'
        }
    });

})(name);