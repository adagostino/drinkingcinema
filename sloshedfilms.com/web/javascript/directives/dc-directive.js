var name = "directive";
(function(name){
    var directive = new function(){
        this.$dcType = "directive";

        this.formatOpts = function(opts, defaults) {
            defaults = defaults || {};
            // extend the options
            $.extend(opts, defaults);
            // just so it's easier
            var $el = opts.$el || opts.$element || opts.element || opts.el;
            if (!$el || !$el.length) return;
            opts.$el = $el;

            var observers = {};
            opts.$watch = function(path, fn) {
                var scope = this,
                    observer = new PathObserver(scope, path);
                var callback = function(newValue, oldValue){
                    fn.apply(scope, arguments);
                    Platform.performMicrotaskCheckpoint();
                };
                observer.open(callback);
                if (!observers[path]) observers[path] = [];
                observers[path].push(observer);
            };

            opts.$unwatch = function(path) {
                if (!observers[path]) return;
                for (var i=0; i<observers[path].length; i++){
                    observers[path][i].close();
                }
            };

            opts.preventDefault = function(e) {
                e.preventDefault();
            };

            return opts;
        };


    };
    $dc.add(name, directive);
})(name);