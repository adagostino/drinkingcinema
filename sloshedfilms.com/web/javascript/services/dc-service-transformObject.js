var name = "service.transformObject";
(function(){

    var transformObject = function(transformStr) {
        this.vendorPrefix =  $dc.utils.getVendorPrefix();
        this.transformAttr = this.vendorPrefix + "transform";
        this.transitionDurationAttr = this.vendorPrefix + "transition-duration";
        this.setReferenceTransform(transformStr);
    };

    transformObject.prototype.paramMap = {
        scaleX: 0,
        scaleY: 3,
        translateX: 4,
        translateY: 5
    };

    transformObject.prototype.setReferenceTransform = function(transformStr){
        this.referenceTransform = this.parseTransform(transformStr);
    };

    transformObject.prototype.getIndexOfParam = function(key) {
        var idx = this.paramMap[key];
        return (typeof idx === "number") ? idx : undefined;
    }

    transformObject.prototype.getValueForParam = function(key) {
        var idx = this.getIndexOfParam(key);
        return (typeof idx === "number") ? this.referenceTransform[idx] : undefined;
    };

    transformObject.prototype.getTransformArrayForParams = function(params, isDelta) {
        params = params || {};
        var transformArray =  this.copyTransformArray();
        for (var param in params){
            var idx = this.paramMap[param];
            if (typeof idx === "number") transformArray[idx] = params[param] + (isDelta ? this.getValueForParam(param) : 0);
        }
        return transformArray;
    };

    transformObject.prototype.getTransformForParams = function(params, isDelta) {
        return this.stringifyTransform(this.getTransformArrayForParams(params, isDelta));
    };

    transformObject.prototype.getTransformForDeltaParams = function(params) {
        return this.getTransformForParams(params, true);
    };

    transformObject.prototype.copyTransformArray = function(){
        var a = [];
        for (var i=0; i<this.referenceTransform.length; i++){
            a.push(this.referenceTransform[i]);
        }
        return a;
    };

    transformObject.prototype.getParamsFromTransformArray = function(transformArray){
        var a = transformArray;
        return{
            scaleX: a[this.paramMap.scaleX],
            scaleY: a[this.paramMap.scaleY],
            translateX: a[this.paramMap.translateX],
            translateY: a[this.paramMap.translateY]
        }
    };

    transformObject.prototype.getReferenceParams = function(withDeltaParams) {
        return this.getParamsFromTransformArray(this.getTransformArrayForParams(withDeltaParams, true));
    };

    transformObject.prototype.getBaseTransformArray = function(){
        return [1, 0, 0, 1, 0, 0];
    };

    transformObject.prototype.parseTransform = function(transformStr){
        transformStr = transformStr || "";
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

    //*** convenience methods to get and set transform/transitions on elements ***//

    // set the base transform of this object to the current transform of an element
    transformObject.prototype.setReferenceTransformFromElement = function($el){
        this.setReferenceTransform($el.css(this.transformAttr));
    };

    // set the transition time on an element
    transformObject.prototype.setTransitionTimeOnElement = function($el, timeStr) {
        $el.css(this.transitionDurationAttr, timeStr);
    };

    // set the transform of an element to the params specified
    transformObject.prototype.setTransformOnElementFromParams = function($el, params) {
        $el.css(this.transformAttr, this.getTransformForParams(params));
    };

    transformObject.prototype.setTransformOnElementFromDeltaParams = function($el, deltaParams) {
        $el.css(this.transformAttr, this.getTransformForDeltaParams(deltaParams));
    };


    $dc.addService(name, transformObject);
})(name);