var name = "directive.modal";
(function(name){
    var defaults = {
        'cancel': function(){
            this.hide();
            this.call(this.onCancel);
        },
        'beforeShow': function(){
            //console.log("default before show");
        },
        'show': function(callback){

            this.beforeShow();
            this.open = true;
            this.$timeout(function(){
               this.afterShow(callback);
            });
        },
        'afterShow': function(callback){

        },
        'hide': function(callback){
            this.open = false;
            this.$timeout(function(){
                this.afterHide(callback);
            });

        },
        'afterHide': function(callback){
            //console.log("default after hide");
        }
    };

    // https://tylercipriani.com/2014/07/12/crossbrowser-javascript-scrollbar-detection.html
    var hasScrollbar = function() {
        // The Modern solution
        if (typeof window.innerWidth === 'number')
            return window.innerWidth > document.documentElement.clientWidth

        // rootElem for quirksmode
        var rootElem = document.documentElement || document.body

        // Check overflow style property on body for fauxscrollbars
        var overflowStyle

        if (typeof rootElem.currentStyle !== 'undefined')
            overflowStyle = rootElem.currentStyle.overflow

        overflowStyle = overflowStyle || window.getComputedStyle(rootElem, '').overflow

        // Also need to check the Y axis overflow
        var overflowYStyle

        if (typeof rootElem.currentStyle !== 'undefined')
            overflowYStyle = rootElem.currentStyle.overflowY

        overflowYStyle = overflowYStyle || window.getComputedStyle(rootElem, '').overflowY

        var contentOverflows = rootElem.scrollHeight > rootElem.clientHeight
        var overflowShown    = /^(visible|auto)$/.test(overflowStyle) || /^(visible|auto)$/.test(overflowYStyle)
        var alwaysShowScroll = overflowStyle === 'scroll' || overflowYStyle === 'scroll'

        return (contentOverflows && overflowShown) || (alwaysShowScroll)
    };

    var getScrollBarPadding = function(){
        return typeof window.innerWidth === 'number' ? window.innerWidth - document.documentElement.clientWidth : 15;
    }

    var modal = function(opts){

        this.init = function(){
            this.open = false;
            this.modalTemplate = this.modalTemplate || $("#dc-directive-modal-template").html();
            this.$el = $dc.viewParser.parse(this.modalTemplate).getElement(this);

            this.paddingRight;
            $("body").append(this.$el);

            this.$watch("open", function(n,o){
               if (n) {
                   this.paddingRight = hasScrollbar() ? getScrollBarPadding() : 0;
                   $("body").addClass("modal-open");
                   this.paddingRight && $("body").css("padding-right", this.paddingRight + "px");
               } else {
                   $("body").removeClass("modal-open").css("padding-right","");
                   this.paddingRight = 0;
               }
            });

        }

    };
    $dc.directive.add(name, {
        "directive": modal,
        "template": "#dc-directive-modal-template",
        "defaults": defaults
    });
})(name);