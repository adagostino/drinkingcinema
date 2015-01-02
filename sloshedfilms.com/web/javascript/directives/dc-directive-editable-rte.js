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

    var defaults = {
        'onBlur': function(){
            this._super();
            this.processLinks();
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
                case keys["="]:
                    //(ctrl || cmd) ? shift ? insert("superscript") : insert("subscript"): null;
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
        },
        'onMouseup': function(e){
            this.update();
        },
        'bold': function(){
            this.insert("bold");
        },
        'italic': function(){
            this.insert("italic");
        },
        'underline': function(){
            this.insert('underline');
        },
        'alignLeft': function(){
            this.insert('justifyLeft');
        },
        'alignCenter': function(){
            this.insert('justifyCenter');
        },
        'alignRight': function(){
            this.insert('justifyRight');
        },
        'alignFull': function(){
            this.insert('justifyFull');
        },
        'list': function(){
            this.insert("insertOrderedList");
        },
        'bullets': function(){
            this.insert("insertUnorderedList");
        },
        'indent': function(){
            this.insert("indent");
        },
        'outdent': function(){
            this.insert("outdent");
        },
        'link': function(){
            this.modal.linkText = $dc.utils.rangeHelper.getSelectionText();
            this.modal.show();
        },
        'unlink': function(){
            this.removeLink();
        }
    };

    var rte = function(opts){
        var $scope;
        this.isRTE = true;

        this.reset = function(){
            this.selection = {};
            this.ctrl = false;
            this.cmd = false;
            this.shift = false;
        };

        this.setStyle = function(key){
            if (!this.selection) this.selection = {};
            if (!this.selection.styles) this.selection.styles = {};

            var command = this.isCommandSet(key);
            this.selection.styles[command.key] = command.isset ? undefined : command.expected;
        };

        this.isCommandSet = function(key){
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

        this.insert = function(key, val) {
            if (!this.hasFocus) return;
            var expectedValue = _styleMap[key] ? !this.isCommandSet(key).isset : false;
            var o = document.execCommand(key, false, val || null);
            this.update();
            var value = _styleMap[key] ? this.isCommandSet(key).isset : false;
            value !== expectedValue && this.setStyle(key);
            return o;
        };

        this.update = function($el){
            var selection = $dc.utils.rangeHelper.getSelectionObject(_cssStyleMap,$el);
            this.selection = selection;
        };

        this.removeLink = function(){
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

        this.changeLink = function(){
            var oRange = this.selection.range;
            var $a = this.selection.inAnchor;
            if (!$a) return;
            this.modal.linkText = $a.text();
            this.modal.linkHref = $a.attr("href");
            this.modal.editLink = true;

            $scope.modal.show();
        };

        this.processLinks = function(){
            // unfortunately there's no easy way to get the anchor you just dropped in,
            // so we'll have to create a fake one, then find it, then set the
            // correct href and attributes manually.
            $("a").not("[target]").attr("target","_blank");
        }

        var _showLinkPanel = function(){
            var parentRect = $scope.$el[0].getBoundingClientRect(),
                rect = $scope.selection.boundingClientRect,
                $a = $scope.selection.inAnchor,
                link = $a.attr("href"),
                maxWidth = 435,
                useRight = rect.left + maxWidth >= parentRect.right;

            var linkPanel = {
                link: link,
                top: rect.bottom - parentRect.top,
                left: useRight ? 'auto' : rect.left - parentRect.left,
                right: useRight ? parentRect.right - rect.right : 'auto',
                anchor: $scope.selection.inAnchor
            };

            $scope.linkPanel = linkPanel;
        };

        var _hideLinkPanel = function(){
            $scope.linkPanel = undefined;
        };

        var _initModal = function(){
            var $ce = $scope.$ce,
                oRange,
                $a;
            // later can check if in anchor for a change event
            $scope.modal = $dc.directive.modal.init({
                'template': "#dc-directive-editable-modal-template",
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
                    //$dc.utils.rangeHelper.moveCursor($input);
                },
                'afterHide': function(){
                    $ce.focus();
                    $dc.utils.rangeHelper.setSelection(oRange);
                    this.addLink && !this.editLink && $scope.insert("createLink", this.linkHref);
                    this.editLink && this.linkHref && $a && $a.attr("href", this.linkHref);
                    this.reset();
                    $scope.update();
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
            });
        };

        this.init = function() {
            this._super();
            $scope = this;

            _initModal();

            this.$watch('editing', function(n,o){
               if (!n) {
                   $scope.reset();
               }
            });

            this.$watch('selection', function(n,o){
                try {
                    $scope.selection.inAnchor ? _showLinkPanel() : _hideLinkPanel();
                } catch (e) {
                    _hideLinkPanel();
                }

            });

            this.reset();

        }
    };

    $dc.directive.add(name, rte, defaults);
})(name);
