var name = "directive.carousel";
(function(name){

    var _parseTransform = function(transform) {

    };

    var _stringifyTransform = function(a,use3D){
        use3D = typeof use3D === "boolean" ? use3D : true;
        // a = [scaleX,0,0,scaleY,transX,transY];
        // a3d =           [scaleX,0,0,0,0,scaleY,0,0,0,0,scaleZ,0,transX,transY,transZ,1];
        var str = "matrix("+ a[0] + ",0,0,"+ a[3] + ","+a[4] + "," + a[5] + ")";
        var str3d = "matrix3d("+a[0]+",0,0,0,0,"+a[3]+",0,0,0,0,1,0,"+a[4]+","+a[5] +",0,1)";

        return use3D ? str3d : str;
    };


    var transformObject = function(transformStr) {
        this.originalTransform = this.parseTransform(transformStr);
    };

    transformObject.prototype.paramMap = {
        scaleX: 0,
        scaleY: 3,
        translateX: 4,
        translateY: 5
    };

    transformObject.prototype.getTransformForDeltaX = function(deltaX) {
        return this.stringifyTransform(this.getTransformArrayForDeltaX(deltaX));
    };

    transformObject.prototype.getTransformForParams = function(params) {
        var transformArray =  this.copyTransformArray();
        for (var param in params){
            var idx = this.paramMap[param];
            if (typeof idx === "number") transformArray[idx] = params[param];
        }
        return this.stringifyTransform(transformArray);
    };

    transformObject.prototype.getTransformArrayForDeltaX = function(deltaX) {
        var transformArray = this.copyTransformArray();
        transformArray[4]+=deltaX;
        return transformArray;
    };

    transformObject.prototype.copyTransformArray = function(){
        var a = [];
        for (var i=0; i<this.originalTransform.length; i++){
            a.push(this.originalTransform[i]);
        }
        return a;
    };

    transformObject.prototype.getTransformParams = function(transformArray){
        var a = transformArray;
        return{
            scaleX: a[this.paramMap.scaleX],
            scaleY: a[this.paramMap.scaleY],
            translateX: a[this.paramMap.translateX],
            translateY: a[this.paramMap.translateY]
        }
    };

    transformObject.prototype.getTransformParamsForDeltaX = function(deltaX) {
        return this.getTransformParams(this.getTransformArrayForDeltaX(deltaX));
    };

    transformObject.prototype.getBaseTransformArray = function(){
        return [1, 0, 0, 1, 0, 0];
    };

    transformObject.prototype.parseTransform = function(transformStr){
        var a = [];
        transformStr.replace(/(-*\d+\.*\d*)(?:[\,)])/g,function(){
            a.push(parseFloat(arguments[1]));
        });
        if (!a.length){
            a = this.getBaseTransformArray();
        }
        var b;
        // in case we get a matrix3d
        if (a.length > 6){
            b = [a[0],0,0,a[5],a[12],a[13]];
        }else{
            b = a;
        }

        return b;
    };

    transformObject.prototype.stringifyTransform = function(transformArray,use3D){
        use3D = typeof use3D === "boolean" ? use3D : true;
        var a = transformArray;
        // a = [scaleX,0,0,scaleY,transX,transY];
        // a3d =           [scaleX,0,0,0,0,scaleY,0,0,0,0,scaleZ,0,transX,transY,transZ,1];
        var str = "matrix("+ a[0] + ",0,0,"+ a[3] + ","+a[4] + "," + a[5] + ")";
        var str3d = "matrix3d("+a[0]+",0,0,0,0,"+a[3]+",0,0,0,0,1,0,"+a[4]+","+a[5] +",0,1)";

        return use3D ? str3d : str;
    };


    var carousel = function(){};

    carousel.prototype.init = function(){
        this.$carousel = this.$el.find(".dc-carousel-items-container");
        this.$carouselItems = this.$carousel.find(".dc-carousel-item");
        this.vendorPrefix = $dc.utils.getVendorPrefix()
        this.transformAttr = this.vendorPrefix + "transform";
        this.transitionDurationAttr = this.vendorPrefix + "transition-duration";
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
                this.transformObject = new transformObject(this.$carousel.css(this.transformAttr));
                this.$carousel.css(this.transitionDurationAttr, "0s");
                break;
            case "pan":
                this.$carousel.css(this.transformAttr,this.transformObject.getTransformForDeltaX(e.deltaX));
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
        var iw = $(this.$carouselItems[0]).outerWidth() // assume all items are the same width;
        var time = 400;
        var deltaX = e.deltaX - e.velocityX * 200;
        var x = this.transformObject.getTransformParamsForDeltaX(deltaX).translateX;

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
        console.log(w,cw);
        this.$carousel.css(this.transitionDurationAttr, time + "ms");
        this.$carousel.css(this.transformAttr, this.transformObject.getTransformForParams({translateX: x}));
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