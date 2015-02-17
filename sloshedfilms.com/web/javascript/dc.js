var startTime = new Date().getTime();
(function(global){
    // a subclassing method so we can add _super to our inheritance
    var _superPattern = /xyz/.test(function() { xyz;}) ? /\b_super\b/ : /.*/,
        _subClass = function(child, parent){
            parent = parent || function(){};
            var _super = parent.prototype;
            var proto = new parent(),
                properties = typeof child === "function" ? new child() : child;

            for (var name in properties){
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

            function Class() {

            };

            Class.prototype = proto;
            Class.constructor = Class;
            Class.subClass = arguments.callee;
            return Class;
        };

    var dc = function(){
        this.globals = {
            "cdn": "http://cdn.drinkingcinema.com/"
        };

        var _mvc = {},
            _paths = [],
            _pathsStr = "";

        // a way to add classes to dc
        this.add = function(name, fn, dontSubclass) {
            // add the fn to an array which we'll use to extend these items later
            _paths.push({
                name: name,
                fn: fn,
                dontSubclass: dontSubclass
            });
        };

        this.subClass = function(child,parent){
            return _subClass(child,parent);
        };

        var _namePattern = /(.*)\.([^.]*)$/; //0: full, 1: parent, 2: child
        this.extend = function(name,fn,dontSubclass){
            if (!name || typeof name !== "string") return;
            var match = name.match(_namePattern),
            // store these in _mvc so we can initialize under the real name later
                parent = match ? Path.get(match[1]).getValueFrom(_mvc) : undefined;
            // make a sanity check so that we don't try to extend from something that isn't there
            if (!!match && !parent) {
                console.warn('Could not find parent', match[1], 'when trying to extend', name, '. Are you sure you included that file or class?');
                return;
            };
            // adding the name for the hell of it
            fn.prototype.$dcName = name;
            // can add some defaults here like type, timeout, watch, etc
            var self = this;
            if (!match && !dontSubclass) {
                fn.prototype.$dcType = name;
                fn.prototype.$watch = function () {return self.$watch.apply(this, arguments)};
                fn.prototype.$timeout = function () {return self.$timeout.apply(this, arguments)};
                fn.prototype.$call = function(){return self.$call.apply(this,arguments)};
                fn.prototype.preventDefault = function(e){e.preventDefault()};
            }
            var child = dontSubclass ? fn : this.subClass(fn, parent);
            // set the path
            Path.get(name).setValueFrom(_mvc,child);
            _pathsStr += _pathsStr ? "," + name : name;
        };

        // use this to build up the controllers, models, directives added to dc
        this.initComponent = function(str, initializeOnce){
            // initialize once is used to set the value to a class instead of a constructor
            initializeOnce = !!initializeOnce;
            var itemReg = new RegExp(str + '[-A-Za-z0-9_\\.]*','ig'),
                components = {};

            _pathsStr.replace(itemReg, function(match){
                var fn = Path.get(match).getValueFrom(_mvc),
                    val = initializeOnce ? new fn() : fn;
                Path.get(match).setValueFrom(this, val);
                components[match] = val;
            }.bind(this));
            return components;
        };

        this.extendAll = function(){
            // first sort all of the paths so we can extend them all correctly
            _paths.sort(function(o1,o2){
                if (o1.name > o2.name) {
                    return 1;
                }
                if (o1.name < o2.name) {
                    return -1;
                }
                return 0;
            });
            // next loop through the paths and extend everything using _mvc
            for (var i=0; i<_paths.length; i++) {
                this.extend(_paths[i].name, _paths[i].fn, _paths[i].dontSubclass);
            };
        };

        // add watch, timeout
        this.$watch = function(path, fn){
            var $scope = this,
                observer = new PathObserver($scope, path);
            var callback = function(newValue, oldValue){
                fn.apply($scope, arguments);
                Platform.performMicrotaskCheckpoint();
            };
            observer.open(callback);
            // return the unobserve function
            return function(){
                observer.close();
            }
        };

        this.$timeout = function(fn, time){
            if (!fn) return;
            time = time || 0;
            var $scope = this;
            var callback = function(){
                fn.apply($scope, arguments);
                Platform.performMicrotaskCheckpoint();
            };
            var id = setTimeout(callback, time);
            // return the cleartimeout function
            return function(){
                clearTimeout(id);
            }
        };

        this.$call = function(fn){
            if (typeof fn !== "function") return;
            var $scope = this;
            var result = fn.apply($scope, Array.prototype.slice.call(arguments, 1));
            Platform.performMicrotaskCheckpoint();
            // return the result of the function call
            return result;
        };

        var _getDescendant = function(str){
            var itemReg = new RegExp(str + '[-A-Za-z0-9_\\.]*','ig'),
                max = str;

            _pathsStr.replace(itemReg, function(match){
                if (match > max) max = match;
            });
            return max;
        }

        this.initControllers = function(){
            var self = this;
            $("[dc-controller]").each(function(){
                var $this = $(this);
                var name = $this.attr("dc-controller");
                var template = $("#dc-controller-" + name +"-template").html();
                var controller = Path.get(_getDescendant("controller." + name)).getValueFrom(self);
                controller.$call(controller.init);
                var $c = self.watchElement($this, controller, template);
            });
        };

        this.init = function(){
            var startInit = new Date().getTime();
            this.viewParser = new viewParser();
            // extend and subclass controllers, models, directives
            this.extendAll();
            this.initComponent("controller", true);
            this.initComponent("model", true);
            this.initComponent("service");
            var directives = this.initComponent("directive");

            // add the custom directives to the view parser
            for (var key in directives){
                this.viewParser.addCustomDirective(key,directives[key]);
            };
            // get rid of all the twig stuff
            this.formatTemplates();
            // initialize any controllers that are found
            var startInitControllers = new Date().getTime();
            this.initControllers();
            var endTime = new Date().getTime();

            console.log("Add Components", startInit - startTime);
            console.log("Init Components", startInitControllers - startInit);
            console.log("Init Controllers", endTime - startInitControllers);
            console.log("total time", endTime - startTime);
            return this;
        };

    };

    dc.prototype.getScope = function(el) {
        if (!el) return;
        var vpGUID = el._vpGUID;
        if (!vpGUID) return;
        var scopeObj = this.viewParser.getScopeObj(vpGUID);
        return scopeObj ? scopeObj.scope : undefined;
    };

    dc.prototype.formatTemplates = function(){
        // get rid of twig stuff
        $("[type='dc-template']").each(function(){
            var $this = $(this),
                template = $(this).html();
            $this.html(template.replace(/\{\%.*\%\}/g, ""));

        });
    };

    dc.prototype.parseIsolateScope = function($scope, $dc){
        // get paths of the parentScope from the element attributes and set up binding
        // default - one-way binding from parent to child
        // "=" - 2-way binding from child to parent and vise versa
        // "@" - no binding, just the initial value
        // "&" - means it's a function to call
        var reg = /^[@=&]/,
            observers = [],
            self = this;
        for (var key in $scope){
            (function(key){
                var match = $scope[key].match(reg),
                    symbol = match ? match[0] : "",
                    attr = symbol ? $scope[key].slice(1) : $scope[key],
                    str = this.$el.attr(attr),
                    value = Path.get(str).getValueFrom(self.parentScope);
                switch(symbol){
                    case "@":
                        value = str;
                        break;
                    case "&":
                        if (typeof value === "function"){
                            var fn = value;
                            value = function(){
                                return fn.apply(self,arguments);
                            }
                        }
                        break;
                    case "=":
                        // set a watch on the child and change the parent when the child changes
                        var observer = new PathObserver(this, key);
                        var callback = function(n,o){
                            Path.get(str).setValueFrom(self.parentScope,n);
                        };
                        observer.open(callback);
                        observers.push({
                            observer: observer,
                            callback: callback
                        });
                    default:
                        // set a watch on the parent and change the child when the parent changes
                        var observer = new PathObserver(self.parentScope, str);
                        var callback = function(n,o){
                            Path.get(key).setValueFrom(self,n);
                        };
                        observer.open(callback);
                        observers.push({
                            observer: observer,
                            callback: callback
                        });
                        break;
                };
                Path.get(key).setValueFrom(self,value);
            }.bind(this))(key);
        }

        // set the observers here
        if (observers.length){
            var scopeObj = $dc.viewParser.getScopeObj(this.$el[0]._vpGUID);
            if (!scopeObj) console.log("didn't find scope", this.$el);
            observers.splice(0,0,scopeObj.observers.length, 0);
            Array.prototype.splice.apply(scopeObj.observers,observers);
        }
    };

    dc.prototype.addDirective = function(opts){
        if (!opts) return;
        var name = opts.name,
            dir = opts.directive;
        if (!name || !dir) return;
        var self = this;
        if (opts.$scope){
            dir.prototype.isolateScope = opts.$scope;
            dir.prototype.parseIsolateScope = function(){
                self.parseIsolateScope.call(this, opts.$scope, self);
            };
        };
        if (opts.template){
            dir.prototype.template = opts.template;
        }
        this.add(name,dir);
    };

    dc.prototype.addService = function(name,service){
        this.add(name,service,true);
    }

    global.drinkingCinema = global.$dc = new dc();
    $(document).ready(function() {
        global.$dc.init();
    });

})(window);

(function(){
    var utils = function(){
        this.$pre = $("<pre>");
    };

    utils.prototype.roundNum = function(num, dec){
        var sign = num < 0 ? -1 : 1,
            pow = Math.pow(10, dec || 0);
        return sign * Math.round(sign*num*pow)/pow;
    };

    utils.prototype.toUrl = function(str){
        str = str.replace(/\s+/g,"+");
        return encodeURI(str);
    };

    utils.prototype.getJSON = function(json, id){
        if (!window[json]) return;
        var nJSON = $.extend(true,{},window[json]);
        //delete window[json];
        //$("#"+id).remove();
        return nJSON;
    };

    utils.prototype.getText = function(html){
        // kind of bootleg way of doing this -- it's not meant as a way of sanitizing
        // the input, more of a way to preserve line breaks for when I format the input
        // on the backend
        // http://stackoverflow.com/questions/3455931/extracting-text-from-a-contenteditable-div
        this.$pre.html(html);
        this.$pre.find("p").replaceWith(function() { return this.innerHTML + "<br>"; });
        this.$pre.find("div").replaceWith(function() { return "\n" + this.innerHTML; });
        this.$pre.find("br").replaceWith("\n");

        return this.$pre.text();
    };

    utils.prototype.getLocal = function(key){
        return localStorage ? (localStorage.getItem(key) || "") : "";
    };

    utils.prototype.setLocal = function(key, value){
        value = typeof value === "string" ? value : JSON.stringify(value);
        localStorage && localStorage.setItem(key, value);
    };

    $dc.utils = new utils();
})();
