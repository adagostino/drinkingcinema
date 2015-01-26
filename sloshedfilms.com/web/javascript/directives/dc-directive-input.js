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

    var defaults = {
        'onFocus': function(e){
            this.hasFocus = true;
            //this.errors = [];
        },
        'onBlur': function(e){
            this.hasFocus = false;
            var text = $dc.model.comments.getText(this.$input.html());
            if (!$.trim(text).length) Path.get(this.model).setValueFrom(this,"");
            if (this.errors && this.errors.length) this.errors = this.validate();

        },
        'onKeydown': function(e){
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
        },
        'onKeyup': function(e){
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
        },
        'onPaste': function(e){
            this.pasted = true;
        },
        'onInput': function(e){
            // if it was just pasted, get rid of all the html
            Path.get(this.model).setValueFrom(this, this.pasted ? this.text()  : this.$input.html());
            this.pasted = false;
        }
    };

    // validators for the text -- return true or false, the scope (ie 'this') is the scope of the text input
    var _validators = {
        'required': {
            test: function() {
                // basically just check if it's a non-empty string
                return !!$.trim(this.text()).length;
            },
            msg: function(){
                return (this.name || "This") + " is required."
            }
        },
        'email': {
            test: function(){
                var email = $.trim(this.text());
                return !!email.match(/^([a-z0-9\+_\-]+)(\.[a-z0-9\+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,6}$/i);
            },
            msg: "Please input a valid Email address."
        },
        'maxLength': {
            test: function(max){
                if (!max) return true; // if max isn't supplied, then it'll always work
                return this.text().length <= max;
            },
            msg: function(max){
                return (this.name || "This") + " exceeds the maximum length" + (max ? " of " + max + "characters" : "") + ".";
            }
        }
    };


    var input = function(opts){
        var $scope;

        var _setValidator = function(){
            if (!$scope.$el.attr("validators")) return;
            var validators = $scope.$el.attr("validators").split(",");
            var reg = new RegExp('=');
            var va = [];
            for (var i=0; i<validators.length; i++){
                var name = validators[i], input;
                if (reg.test(name)){
                    var a = name.split("=");
                    name = a[0];
                    input = a[1];
                }
                (function(validator,input, name){
                    validator && va.push(function(){
                        return this.call(validator.test, input) || (typeof validator.msg === "function" ? this.call(validator.msg, input) : validator.msg);
                    }.bind($scope));
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

        this.text = function(){
            return $dc.model.comments.getText(this.$input.html());
        };

        this.init = function(){
            $scope = this;
            this.model = this.$el.attr("input-model");
            this.name = this.$el.attr("name");
            this.placeholder = this.$el.attr("placeholder");

            var val = Path.get(this.model).getValueFrom(this) || "";
            this.$input = this.$el.find("[contenteditable]").html(val).attr("placeholder",this.$el.attr("placeholder"));
            this.isEmpty = !!!$.trim(val).length;
            this.hasFocus = false;

            this.validate = _setValidator();

            this.$watch(this.model,function(n, o){
                this.$input.html() !== n && this.$input.html(n || "");
                this.isEmpty = !!!$.trim(n).length;
            });
            // watch parent scope
            this.validate && this.$watch("parentScope.submit",function(n,o){
               if (n) {
                   this.errors = this.validate();
               }
            });
        }
    };

    $dc.directive.add(name, {
        "directive": input,
        "template": "#dc-directive-input-template",
        "defaults": defaults,
        "$scope": {}
    });


})(name);

var name = "directive.input.textArea";
(function(){
    var textArea = function(opts){
        var $scope;
        this.init = function(){
            $scope = this;
            this.allowBreaks = true;
            this._super();
        };
    }

    $dc.directive.add(name, {
        "directive": textArea,
        "template": "#dc-directive-input-template",
        "$scope": {}
    });
})(name);