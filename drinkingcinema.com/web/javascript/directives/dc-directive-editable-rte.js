var name = "directive.editable.rte";
(function (name){
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

    var _styleMap = {
        'bold': ['font-weight', 'bold'],
        'italic': ['font-style', 'italic'],
        'underline': ['text-decoration', 'underline'],
        'justifyLeft': ['text-align', 'left'],
        'justifyCenter': ['text-align', 'center'],
        'justifyRight': ['text-align', 'right'],
        'justifyFull': ['text-align', 'justify']
    };

    var _cssStyleMap = {};
    for (var key in _styleMap) _cssStyleMap[_styleMap[key][0]] = _styleMap[key][1];

    var rte = function() {};

    rte.prototype.isRTE = true;

    rte.prototype.init = function(){
        this._super();
        this.initModal();
        this.$watch('editing', function(n,o){
            if (!n) {
                this.reset();
            }
        });

        this.$watch('selection', function(n,o){
            try {
                this.selection.inAnchor ? this.showLinkPanel() : this.hideLinkPanel();
            } catch (e) {
                this.hideLinkPanel();
            }

        });

        this.$watch('content', function(n, o){
           if (this.pasted) {
               this.cleanPasted();
               this.pasted = false;
           }
        });

        this.$watch('rawContent', function(n, o) {
            if (this.content !== n) this.content = n;
        });

        this.reset();
    };

    rte.prototype.initModal = function(){
        var $scope = this,
            $ce = $scope.$ce,
            oRange,
            $a;
        var opts = {
            'template': "#dc-directive-editable-modal-template",
            'parentScope': $scope,
            'onKeyup': function(e){
                switch(e.which){
                    case keys["return"]:
                        this.submit();
                        break;
                    default:
                        break;
                }
            },
            'beforeShow': function(){
                oRange = $scope.selection.range;
                $a = $scope.selection.inAnchor;
            },
            'afterShow': function(){
                $ce.blur();
                var $input = this.$el.find("input");
                $input.focus();
            },
            'afterHide': function(){
                $ce.focus();
                $dc.utils.rangeHelper.setSelection(oRange);
                this.addLink && !this.editLink && $scope.insert("createLink", this.linkHref);
                this.editLink && this.linkHref && $a && $a.attr("href", this.linkHref);
                $scope.processLinks();
                this.reset();
                $scope.update();
                // remember, the model is only listening to "input", so changing the html directly won't
                // trigger an input event. instead we have to trigger it manually;
                $ce.trigger('input');

            },
            submit: function(fn){
                this.linkHref = $.trim(this.linkHref);
                this.addLink = !!this.linkHref;
                this.hide();
            },
            reset: function(){
                this.linkText = "";
                this.linkHref = "";
                this.addLink = false;
                this.editLink = false;
            }
        };
        this.modal = $dc.service.modal(opts);
    };

    rte.prototype.reset = function(){
        this.selection = {};
        this.ctrl = false;
        this.cmd = false;
        this.shift = false;
        this.showRaw = false;
        this.rawHeight = "";
        this.rawWidth = "";
    };

    rte.prototype.showLinkPanel = function(){
        var parentRect = this.$el[0].getBoundingClientRect(),
            rect = this.selection.boundingClientRect,
            $a = this.selection.inAnchor,
            link = $a.attr("href"),
            maxWidth = 435,
            useRight = rect.left + maxWidth >= parentRect.right;

        var linkPanel = {
            link: link,
            top: rect.bottom - parentRect.top,
            left: useRight ? 'auto' : rect.left - parentRect.left,
            right: useRight ? parentRect.right - rect.right : 'auto',
            anchor: this.selection.inAnchor
        };

        this.linkPanel = linkPanel;
    };

    rte.prototype.hideLinkPanel = function(){
        this.linkPanel = undefined;
    };

    rte.prototype.setStyle = function(key){
        if (!this.selection) this.selection = {};
        if (!this.selection.styles) this.selection.styles = {};

        var command = this.isCommandSet(key);
        this.selection.styles[command.key] = command.isset ? undefined : command.expected;
    };

    rte.prototype.isCommandSet = function(key){
        var a = _styleMap[key] || [];
        var o = {
            isset: false,
            key: a[0]
        };
        try {
            var curr = this.selection.styles[a[0]];
            o.isset = curr === a[1];
            o.curr = curr;
            o.expected = a[1];
        } catch (e){
            //console.log(e);
        }
        return o;
    };

    rte.prototype.insert = function(key, val) {
        if (!this.hasFocus) return;
        var expectedValue = _styleMap[key] ? !this.isCommandSet(key).isset : false;
        var o = document.execCommand(key, false, val || null);
        this.update();
        var value = _styleMap[key] ? this.isCommandSet(key).isset : false;
        value !== expectedValue && this.setStyle(key);
        return o;
    };

    rte.prototype.update = function($el){
        var selection = $dc.utils.rangeHelper.getSelectionObject(_cssStyleMap,$el);
        this.selection = selection;
    };

    rte.prototype.removeLink = function(){
        // manually remove the anchor so we don't have to select text
        var oRange = this.selection.range;
        try {
            $dc.utils.rangeHelper.selectText(this.linkPanel.anchor);
            this.insert("unlink");
            $dc.utils.rangeHelper.setSelection(oRange);
            this.update();
        } catch (e) {

        }
    };

    rte.prototype.changeLink = function(){
        var oRange = this.selection.range;
        var $a = this.selection.inAnchor;
        if (!$a) return;
        this.modal.linkText = $a.text();
        this.modal.linkHref = $a.attr("href");
        this.modal.editLink = true;

        this.modal.show();
    };

    rte.prototype.processLinks = function(){
        // unfortunately there's no easy way to get the anchor you just dropped in,
        // so we'll have to create a fake one, then find it, then set the
        // correct href and attributes manually.
        this.$ce.find("a").not("[target]").attr("target","_blank");
    }

    // Events:
    rte.prototype.onKeydown = function(e) {
        switch (e.which) {
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
                if (this.ctrl || this.cmd) {
                    e.preventDefault();
                    this.insert("bold");
                }
                break;
            case keys["i"]:
                if (this.ctrl || this.cmd) {
                    e.preventDefault();
                    this.insert("italic");
                }
                break;
            case keys["u"]:
                if (this.ctrl || this.cmd) {
                    e.preventDefault();
                    this.insert("underline");
                }
                break;
            default:
                break;
        }
    };

    rte.prototype.onKeyup = function(e){
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
            case keys["up"]:
            case keys["down"]:
            case keys["left"]:
            case keys["right"]:
                this.update();
                break;
            default:
                this.selection.inAnchor && this.update();
                break;
        }
    };

    rte.prototype.onMouseup = function(e){
        this.hasFocus && this.update();
    };

    // RTE Buttons:
    rte.prototype.bold = function(){
        this.insert("bold");
    };

    rte.prototype.italic = function(){
        this.insert("italic");
    };

    rte.prototype.underline = function(){
        this.insert('underline');
    };

    rte.prototype.alignLeft = function(){
        this.insert('justifyLeft');
    };

    rte.prototype.alignCenter = function(){
        this.insert('justifyCenter');
    };

    rte.prototype.alignRight = function(){
        this.insert('justifyRight');
    };

    rte.prototype.alignFull = function(){
        this.insert('justifyFull');
    };

    rte.prototype.list = function(){
        this.insert("insertOrderedList");
    };

    rte.prototype.bullets = function(){
        this.insert("insertUnorderedList");
    };

    rte.prototype.indent = function(){
        this.insert("indent");
    };

    rte.prototype.outdent = function(){
        this.insert("outdent");
    };

    rte.prototype.link = function(){
        this.modal.linkText = $dc.utils.rangeHelper.getSelectionText();
        this.modal.show();
    };

    rte.prototype.unlink = function(){
        this.removeLink();
    };

    rte.prototype.toggleRaw = function(){
        if (!this.$textArea) this.$textArea = this.$el.find(".dc-directive-editable-body-raw");
        this.showRaw = !!!this.showRaw;
        if (this.showRaw) {
            var boundingRect = this.$ce[0].getBoundingClientRect();
            this.hideLinkPanel();
            this.rawContent = this.content;
            this.rawWidth = boundingRect.width;
            this.rawHeight = boundingRect.height;
        } else {
            this.rawWidth = "";
            this.rawHeight = "";
        }

    };

    rte.prototype.onPaste = function(e){
        // TODO: figure out how to do this non brute force -- not good for editing raw and then pasting
        if (!this.isRTE) return;
        this.pasted = true;
    };

    rte.prototype.cleanPasted = function(){
        this.content = this.content.replace(/\bstyle=(?:\")*(?:\')*(?:[^\"^\']*)(?:\")*(?:\')*/g, function(match){
            return "";
        });
        this.$timeout(function(){
            this.processLinks();
            this.$ce.trigger('input');
        });
    };

    $dc.addDirective({
        name: name,
        directive: rte,
        template: "#dc-directive-editable-template",
        $scope: {
            content: "content",
            submit: "&submit"
        }

    });

})(name);
