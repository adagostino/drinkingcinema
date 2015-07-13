var name = "directive.carousel";
(function(name){
    var carousel = function(){};

    carousel.prototype.init = function(){
        if (this.maxChange) {
            this.maxChange = parseInt(this.maxChange);
        }
        this.$carousel = this.$el.find(".dc-carousel-items-container");
        this.$carouselItems = this.$carousel.find(".dc-carousel-item");
        this.transformObject = new $dc.service.transformObject();
        var self = this;
        var h = new Hammer(this.$carousel[0]);
        h.on("pan panstart panend pancancel",function(e){
            (e.srcEvent || e).stopPropagation();
            self.$call(self.handleDrag, e)
        });
        $(window).on("orientationchange resize", function(){
            this.transformObject && this.$call(this.setToIndex, this.currentIndex, 0);
        }.bind(this));
    };

    carousel.prototype.handleDrag = function(e){
        if (this.askPermission && !this.$call(this.askPermission, e)) return;

        switch(e.type) {
            case "panstart":
                //this.transformObject = new transformObject(this.$carousel.css(this.transformAttr));
                this.setReferenceParams = true;
                this.transformObject.setReferenceTransformFromElement(this.$carousel);
                this.transformObject.setTransitionTimeOnElement(this.$carousel, "0s");
                break;
            case "pan":
                if (!this.setReferenceParams) {
                    this.setReferenceParams = true;
                    this.transformObject.setReferenceTransformFromElement(this.$carousel);
                    this.transformObject.setTransitionTimeOnElement(this.$carousel, "0s");
                }
                this.transformObject.setTransformOnElementFromDeltaParams(this.$carousel, {'translateX': e.deltaX});
                break;
            case "pancancel":
            case "panend":
                this.handleDragEnd(e);
                this.setReferenceParams = false;
                break;

        }
    };

    carousel.prototype.getWidths = function() {
        return {
            carousel: this.$carousel.outerWidth(),
            outer: this.$el.outerWidth(),
            item: $(this.$carouselItems[0]).outerWidth()
        }
    }

    carousel.prototype.handleDragEnd = function(e) {
        var start = new Date().getTime();
        var width = this.getWidths();
        var cw = width.carousel;
        var w = width.outer;
        var iw = width.item; // assume all items are the same width;
        var time = 400;
        var deltaX = e.deltaX - e.velocityX * 200;
        var x = this.transformObject.getReferenceParams({'translateX': deltaX}).translateX;

        if (this.maxChange) {
            if (Math.abs(x / iw) > (this.currentIndex + this.maxChange)) {
                x = -(this.currentIndex + (x < 0 ? this.maxChange : 0)) * iw;
            } else if (Math.abs(x / iw) < (this.currentIndex - this.maxChange)) {
                x = -(this.currentIndex - this.maxChange) * iw;
            }
        }

        //x+= e.velocityX * 400;
        if (x > 0 || cw <= w) {
            x = 0;
        } else if (cw + x < w) {
            x = w - cw;
        } else {
            var sum = 0;
            var currItemWidth = 0;
            for (var i=0; i<this.$carouselItems.length; i++){
                sum+= iw;
                if (-sum < x) {
                    break;
                }
            }

            if ((sum + x) > iw/2) {
                // then slide over to show partially hidden item
                x = -sum + iw;
            } else {
                // keep going to hide the partially hidden item
                x = -sum;
            }
        }
        var idx = x/iw;
        this.setToIndex(Math.abs(idx), time, iw);
    };

    carousel.prototype.setToIndex = function(idx, time, iw) {
        this.currentIndex = idx;
        iw = iw || this.getWidths().item;
        this.transformObject.setTransitionTimeOnElement(this.$carousel, time + "ms");
        this.transformObject.setTransformOnElementFromParams(this.$carousel,{translateX: -iw*idx});
        this.$call(this.onChange, idx, time);
    };

    $dc.addDirective({
        name: name,
        directive: carousel,
        template: "#dc-directive-carousel-template",
        $scope: {
            items: "carousel-items",
            itemTemplate: "@carousel-item-template",
            onChange: "&carousel-change",
            askPermission: "&carousel-permission",
            maxChange: "@carousel-max-change"
        }
    });

})(name);