var name = "directive.infiniteScroll";
(function(name){
    var infiniteScroll = function(){};
    var _$doc = $(document),
        _$win = $(window),
        _buffer = 300; // can later change this to be a scope variable

    infiniteScroll.prototype.init = function(){
        // later, if needed, we can add a scope param that's "contain" and we can listen to
        // scroll on this.$el instead of window.
        var self = this,
            $el = this.$el,
            buffer = 300,
            st, wh, h, ot, ob;

        if (!$(this.itemTemplate).html()){
            console.log("No infinite scroll template found!");
        }

        $(document).on("scroll",function(){
            self.$call(self.onScroll);
        });
        this.$timeout(this.onScroll);
    };

    infiniteScroll.prototype.onScroll = function() {
        var st = _$doc.scrollTop(),
            wh = _$win.height(),
            ot = this.$el.offset().top,
            h = this.$el.outerHeight(true),
            ob = ot + h;
        if (st + wh > ot && st < ob && (ob - (st + wh) < _buffer)){
            this.next();
        }
    };

    infiniteScroll.prototype.next = function(){
        var self = this;
        this.source && this.source.next(function(){self.$call(self.onScroll)});
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