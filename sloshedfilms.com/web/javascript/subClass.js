// a subclassing method adapted from Secrets of the JavaScript ninja (page 145)
(function(name){
    var _initializing = false,
        _superPattern = /xyz/.test(function() { xyz;}) ? /\b_super\b/ : /.*/;

    Object.subClass = function(properties){
        var _super = this.prototype;
        _initializing = true;
        var proto;
        try{
            proto = new this();
        } catch(e) {
            proto = new this.constructor();
            _super = this;
        }
        _initializing = false;
        for (var name in properties) {
            if (typeof properties[name] === "function" &&
                typeof _super[name] === "function" &&
                _superPattern.test(properties[name])){
                proto[name] = (function(name,fn) {
                    return function(){
                        var tmp = this._super;
                        this._super = _super[name];
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;
                        return ret;
                    }
                })(name, properties[name]);
            }else{
                proto[name] = properties[name];
            }
        };
        // create a dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if (!_initializing && this.init){
                this.init.apply(this, arguments);
            }
        };

        Class.prototype = proto;
        Class.constructor = Class;
        Class.subClass = arguments.callee;
        return Class;

    };


})();
