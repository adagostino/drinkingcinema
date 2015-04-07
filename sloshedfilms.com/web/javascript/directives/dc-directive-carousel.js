var name = "directive.carousel";
(function(name){
    var carousel = function(){};

    carousel.prototype.init = function(){
        this.$carousel = this.$el.find(".dc-carousel-items-container");
        this.$carouselItems = this.$carousel.find(".dc-carousel-item");
        var self = this;
        Hammer(this.$carousel[0]).on("pan panstart panend",function(e){self.$call(self.handleDrag, e)});
        $(window).on("orientationchange", function(){
            self.transformObject && self.$call(self.handleDrag, {
                type: 'panend',
                deltaX: 0,
                velocityX: 0
            });
        });
    };

    carousel.prototype.handleDrag = function(e){
        switch(e.type) {
            case "panstart":
                //this.transformObject = new transformObject(this.$carousel.css(this.transformAttr));
                if (!this.transformObject) this.transformObject = new $dc.service.transformObject();
                this.transformObject.setReferenceTransformFromElement(this.$carousel);
                this.transformObject.setTransitionTimeOnElement(this.$carousel, "0s");
                break;
            case "pan":
                this.transformObject.setTransformOnElementFromDeltaParams(this.$carousel, {'translateX': e.deltaX});
                break;
            case "pancancel":
            case "panend":
                this.handleDragEnd(e);
                break;

        }
    };

    carousel.prototype.handleDragEnd = function(e) {
        var start = new Date().getTime();
        var cw = this.$carousel.outerWidth();
        var w = this.$el.outerWidth();
        var iw = $(this.$carouselItems[0]).outerWidth(); // assume all items are the same width;
        var time = 400;
        var deltaX = e.deltaX - e.velocityX * 200;
        var x = this.transformObject.getReferenceParams({'translateX': deltaX}).translateX;

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
        this.transformObject.setTransitionTimeOnElement(this.$carousel, time + "ms");
        this.transformObject.setTransformOnElementFromParams(this.$carousel,{translateX: x});

    }

    $dc.addDirective({
        name: name,
        directive: carousel,
        template: "#dc-directive-carousel-template",
        $scope: {
            items: "carousel-items",
            itemTemplate: "@carousel-item-template"
        }
    });

})(name)