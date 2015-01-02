var name = "directive";
(function(name){
    var ct = 0;
    var directive = new function(){
        this.$dcType = "directive";
        this.add = function(name, dir, defaults) {
            var fn = new function(){
                this.$dcName = name;
                this.defaults = defaults;
                this.init = function(opts, dontInit){
                    opts = this.formatOpts(opts, defaults);
                    if (!opts) return;
                    var names = this.$dcName.split(".");
                    var parentName = names.splice(0,names.length - 1).join(".");
                    var parent = Path.get(parentName).getValueFrom($dc);

                    var d = typeof parent.init === "function" ? $dc.subClass(parent.init(opts,true), new dir()) : new dir(opts);

                    !dontInit && (function (){
                        $.extend(d,opts);
                        typeof d.init === 'function' && d.init();
                    })();
                    return d;
                }
            };
            $dc.extend(name, fn);
        };

        this.formatOpts = function(opts, defaults) {
            defaults = defaults || {};
            // extend the options
            for (var key in defaults) {
                if (!opts[key]) opts[key] = defaults[key];
            }
            // just so it's easier
            var $el = opts.$el || opts.$element || opts.element || opts.el;
            //if (!$el || !$el.length) return;
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