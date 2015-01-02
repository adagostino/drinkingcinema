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
        'font-style': 'italic',
        'font-weight': 'bold',
        'text-decoration': 'underline',
        'insertUnorderedList': 'ul',
        'insertOrderedList': 'ol',
        'text-align': 'left, right, center, or full'
    };

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
                    (this.ctrl || this.cmd) && this.setStyle("bold");
                    break;
                case keys["i"]:
                    (this.ctrl || this.cmd) && this.setStyle("italic");
                    break;
                case keys["u"]:
                    if (this.cmd){
                        this.insert("underline");
                    } else if (this.ctrl) {
                        this.update();
                        this.setStyle("underline");
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
            this.styles = {};
            this.ctrl = false;
            this.cmd = false;
            this.shift = false;
        }

        this.setStyle = function(style){
            this.styles[style] = !this.styles[style];
        };

        this.insert = function(key, val) {
            if (!this.hasFocus) return;
            var expectedValue = !!!this.styles[key];
            var o = document.execCommand(key, false, val || null);
            this.update();
            var value = !!this.styles[key];
            value !== expectedValue && this.setStyle(key);
            return o;
        };

        this.update = function($el){
            var selection = $dc.utils.rangeHelper.getSelectionObject(_styleMap,$el);
            this.selection = selection;
        };

        this.removeLink = function(){
            // manually remove the anchor so we don't have to select text
            var oRange = $scope.selection.range;
            try {
                $dc.utils.rangeHelper.selectText(this.linkPanel.anchor);
                this.insert("unlink");
                $dc.utils.rangeHelper.setSelection(oRange);
            } catch (e) {

            }
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
                maxWidth = 400,
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
            var $ce = $scope.$ce;
            var oRange;
            // later can check if in anchor for a change event
            $scope.modal = $dc.directive.modal.init({
                'template': "#dc-directive-editable-modal-template",
                'onKeyup': function(e){
                    switch(e.which){
                        case keys["return"]:
                            this.submit();
                            break;
                        default:
                            console.log(e.which);
                            break;
                    }
                },
                'beforeShow': function(){
                    this.reset();
                    this.linkText = $dc.utils.rangeHelper.getSelectionText();
                    oRange = $scope.selection.range;
                    $ce.blur();

                },
                'afterShow': function(){
                    var $input = this.$el.find("input");
                    $input.focus();
                    //$dc.utils.rangeHelper.moveCursor($input);
                },
                'afterHide': function(){
                    $ce.focus();
                    $dc.utils.rangeHelper.setSelection(oRange);
                    this.addLink && $scope.insert("createLink", this.linkHref);
                },
                submit: function(){
                    this.linkHref = $.trim(this.linkHref);
                    this.addLink = !!this.linkHref;
                    this.hide();
                },
                reset: function(){
                    this.linkText = "";
                    this.linkHref = "";
                    this.addLink = false;

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
