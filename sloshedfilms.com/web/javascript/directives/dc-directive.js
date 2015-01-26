var name = "directive";
(function(name){
    var ct = 0;
    var directive = new function(){
        this.$dcType = "directive";
        this.add = function(name, dir) {
            var fn = new function(){
                this.$dcName = name;
                this.defaults = dir.defaults;
                this.init = function(opts, dontInit){

                    opts = $dc.directive.formatOpts(opts, dir.defaults, name);

                    var names = this.$dcName.split(".");
                    var parentName = names.splice(0,names.length - 1).join(".");
                    var parent = Path.get(parentName).getValueFrom($dc);

                    var d = typeof parent.init === "function" ? $dc.subClass(parent.init(opts,true), new dir.directive()) : new dir.directive(opts);

                    //$.extend(d,opts);
                    $dc.directive.extend(d, opts);

                    !dontInit && (function (){
                        d.call(d.init);
                    })();

                    return d;
                }
            };
            $dc.extend(name, fn);

            $dc.viewParser.addCustomDirective(name, {
                "directive": fn,
                "template": function (){
                    return typeof dir.template === "function" ? dir.template() : $(dir.template).html()
                },
                $scope: dir.$scope
            });
        };

        this.extend = function(thisObj, withThatObj){
            var _superPattern = /xyz/.test(function() { xyz;}) ? /\b_super\b/ : /.*/;
            // extend the options
            var _super = withThatObj;
            for (var key in withThatObj) {
                if (!thisObj[key]) {
                    thisObj[key] = withThatObj[key];
                }else {
                    if (typeof thisObj[key] === "function" &&
                        typeof withThatObj[key] === "function" &&
                        _superPattern.test(thisObj[key])){
                        thisObj[key] = (function(name,fn) {
                            return function(){
                                var tmp = this._super;
                                this._super = _super[name];
                                var ret = fn.apply(this, arguments);
                                this._super = tmp;
                                return ret;
                            }
                        })(key, thisObj[key]);
                    }
                }
            };

        };

        this.formatOpts = function(opts, defaults, nameo) {
            defaults = defaults || {};
            opts = opts || {};
            this.extend(opts, defaults);
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

            opts.$timeout = function(fn, time) {
                if (!fn) return;
                time = time || 0;
                var scope = this;
                var callback = function(newValue, oldValue){
                    fn.apply(scope, arguments);
                    Platform.performMicrotaskCheckpoint();
                };
                var id = setTimeout(callback, time);
                return function(){
                    clearTimeout(id);
                }
            };

            opts.call = function(fn) {
                if (typeof fn !== "function") return;
                var scope = this;
                var result = fn.apply(scope, Array.prototype.slice.call(arguments, 1));
                Platform.performMicrotaskCheckpoint();
                return result;
            };
            opts.$dcType = "directive";

            return opts;
        };


    };
    $dc.add(name, directive);
})(name);