var name = "directive.infiniteScroll";
(function(name){
    var infiniteScroll = function(){};

    infiniteScroll.prototype.init = function(){
        // later, if needed, we can add a scope param that's "contain" and we can listen to
        // scroll on this.$el instead of window.
        var self = this,
            $doc = $(document),
            $win = $(window),
            $el = this.$el,
            buffer = 300, // can later change this to be a scope variable
            st, wh, h, ot, ob;
        $(document).on("scroll",function(){
            st = $doc.scrollTop(), wh = $win.height(), ot = $el.offset().top, h = $el.outerHeight(true), ob = ot + h;
            // if the this.$el is on the screen
            if (st + wh > ot && st < ob && (ob - (st + wh) < buffer)){
                self.next();
            }
        });
    };

    infiniteScroll.prototype.next = function(){
        this.source && this.source.next();
    };

    $dc.addDirective({
        name: name,
        directive: infiniteScroll,
        template: "#dc-directive-infinite-scroll-template",
        $scope: {
            itemTemplate: "@item-template",
            source: "source"
        }

    });

})(name);