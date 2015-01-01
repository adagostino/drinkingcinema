var name = "directive.editable.rte";
(function (name){
    var keys = {
        ctrl: 17,
        cmd:  91,
        esc:  27,
        shift:16,
        b:    66,
        i:    73,
        u:    85,
        "=": 187,
        left: 37,
        up:   38,
        right:39,
        down: 40
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

        },
        'unlink': function(){
            console.log("in unlink?");
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

        this.insert = function(key) {
            if (!this.hasFocus) return;
            var expectedValue = !!!this.styles[key];
            document.execCommand(key, false, null);
            this.update();
            var value = !!this.styles[key];
            value !== expectedValue && this.setStyle(key);

        };

        this.update = function($el){
            var selection = $dc.utils.rangeHelper.getSelectionObject(_styleMap,$el);
            this.selection = selection;
        };

        this.removeLink = function(){
            // manually remove the anchor so we don't have to select text
            try {
                var $contents = $scope.linkPanel.anchor.contents();
                this.linkPanel.anchor.replaceWith($contents);
                // bc we are manually removing the anchor, we need to manually update the input
                this.onInput();
                _hideLinkPanel();
                $dc.utils.rangeHelper.moveCursor($contents);
                this.update();
            } catch (e) {

            }
        };

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


        this.init = function() {
            this._super();
            $scope = this;

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

    var fn = new function(){
        this.init = function(opts, dontInit){
            opts = this.formatOpts(opts, defaults);
            if (!opts) return;
            var basic = this._super(opts, true);
            var eo = $dc.subClass(basic, new rte());
            return dontInit ? eo : eo.init();
        }
    };

    $dc.extend(name,fn);
})(name);
