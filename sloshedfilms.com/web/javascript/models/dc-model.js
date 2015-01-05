var name = "model";

(function(name){

    var model = new function(){
        this.$dcType = "model";

        this.call = function(fn) {
            if (typeof fn !== "function") return;
            var scope = this;
            fn.apply(scope, Array.prototype.slice.call(arguments, 1));
            Platform.performMicrotaskCheckpoint();
        };

        this.ajax = function(opts){
            console.log("in ajax");
            Platform.performMicrotaskCheckpoint();
        };

        this.test = function(){
            console.log("in parent");
        };
    };

    //$dc.extend(name, model);
    $dc.add(name, model);
})(name);
