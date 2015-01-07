var name = "controller";

(function(name){

    var controller = new function(){
        this.$dcType = "controller";

        this.$watch = function(path, fn) {
            var scope = this,
                observer = new PathObserver(scope, path);
            var callback = function(newValue, oldValue){
                fn.apply(scope, arguments);
                Platform.performMicrotaskCheckpoint();
            };
            observer.open(callback);
            if (!this.observers) this.observers = {};
            if (!this.observers[path]) this.observers[path] = [];
            this.observers[path].push(observer);
        };

        this.$unwatch = function(path) {
            if (!this.observers || !this.observers[path]) return;
            for (var i=0; i<observers[path].length; i++){
                this.observers[path][i].close();
            }
        };
    };
    //$dc.extend(name, controller);
    $dc.add(name,controller);
})(name);
