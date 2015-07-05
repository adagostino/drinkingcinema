var name = "viewParser";
(function(name){
    var _scopeMap = {};

    var viewParser = function(html, customDirectives){
        this.template = html;
        this.customDirectives = customDirectives || {};
        this.viewObj = this.parseTemplate(html);
        this.parsedObj = undefined;
    };

    viewParser.prototype.getHTML = viewParser.prototype.getHtml = function(obj, $parent) {
        var addParent = !obj.$parent && $parent;
        var addWindow = !obj.window;
        if (addParent) obj.$parent = $parent;
        if (addWindow) obj.window = window;
        var view = this.viewObj.compile(obj);
        if (addParent) delete obj.$parent;
        if (addWindow) delete obj.window;
        return this.compileHTMLStr(view);
    };


    viewParser.prototype.getElement = function(obj, $parent, bind){
        bind = typeof bind === "boolean" ? bind : true;
        if (!this.parsedObj) this.parsedObj = this.viewObj.compile(obj);

        if (!bind) return $(this.getHTML(obj, $parent));

        var parsedHTMLObj = this.compileHTMLEl(this.parsedObj, obj),
            el = this.getNode(parsedHTMLObj);

        Platform.performMicrotaskCheckpoint();
        return el.length ? el : $(el);
    };

    viewParser.prototype.getNode = function(rObj) {
        var $el = rObj.$el,
            nodeType = ($el[0] || $el).nodeType;
        if (nodeType === 11) {
            var a = [];
            for (var child in rObj.children){
                var idx = rObj.children[child].index;
                a[idx] = this.getNode(_scopeMap[child]);
            }
            return $(a.length > 1 ? a : a[0]);
        }
        return $el[0];
    };

    viewParser.prototype.compileHTMLStr = function(parsedHTMLObj) {
        return parsedHTMLObj.html;
    };

    viewParser.prototype.compileHTMLEl = function(parsedHTMLObj, scope, repeatItem, parentGuid){
        if (typeof parsedHTMLObj === "string") return parsedHTMLObj;
        // need concept of $prev and $next and $parent for each element
        var $parent,
            $oEl,
            cloned = false,
            guid = generateGUID(16,true);

        //var $parsedEl = parsedHTMLObj.inRepeat && $toClone ? $toClone : parsedHTMLObj.$el;
        scope = parsedHTMLObj.repeatScope || scope;
        if (repeatItem) {
            parsedHTMLObj.$el = repeatItem.$el;
            parsedHTMLObj.paths = repeatItem.paths;
            parsedHTMLObj.watchList = repeatItem.watchList;
        }

        if (parsedHTMLObj.$el) {
            $parent = $( (parsedHTMLObj.$el[0] || parsedHTMLObj.$el).cloneNode(false) );
            cloned = true;
        } else {
            $parent = parsedHTMLObj.str ? $(parsedHTMLObj.str) : parsedHTMLObj.comment ? $(document.createComment(parsedHTMLObj.openTag + parsedHTMLObj.closeTag)) : document.createDocumentFragment();
            var watches = [];
            var paths = {};
            var ct = 0;
            var addWatches = function(obj, type) {
                for (key in obj) {
                    if (key !== "repeat" || (key === "repeat" && !parsedHTMLObj.inRepeat)){
                        watches.push({
                            name: key,
                            type: type,
                            watch: obj[key].watch,
                            compile: obj[key].compile,
                            custom: obj[key].custom
                        });
                        for (var i in obj[key].paths){
                            var path = obj[key].paths[i];
                            if (!paths[path]) {
                                paths[path] = []
                            }
                            paths[path].push(watches.length - 1);
                            ct++;
                        }
                    }
                }
            };

            addWatches(parsedHTMLObj.item.watches.directives, "directive");
            addWatches(parsedHTMLObj.item.watches.attributes, "attribute");
            addWatches(parsedHTMLObj.item.watches.text ? [parsedHTMLObj.item.watches.text] : [], "text");
            parsedHTMLObj.paths = paths;
            parsedHTMLObj.watchList = watches;
            parsedHTMLObj.$el = $parent;
        }

        var children = {},
            commentGuid;
        for (var i=0; i<parsedHTMLObj.children.length; i++){
            var child = this.compileHTMLEl(parsedHTMLObj.children[i], scope, parsedHTMLObj.repeatItem, guid);
            if (typeof child === "string") {
                if (!parsedHTMLObj.str) $parent = $(document.createTextNode(child));
            } else {
                try {
                    $parent.append(child.$el);
                } catch(e) {
                    $parent.appendChild(child.$el[0] || child.$el);
                }
                var nodeType = (child.$el[0] || child.$el).nodeType;
                //console.log(child.guid === guid, child.guid, guid);
                children[child.guid] = {
                    type: nodeType,
                    index: i
                };

                // set the comment if it's a repeat object -- used later for adding elements when repeat array changes
                if (i===0 && parsedHTMLObj.isRepeat && nodeType === 8) commentGuid = child.guid;

                // adding child to repeat parent for cloning later
                if (parsedHTMLObj.isRepeat && !parsedHTMLObj.repeatItem) {
                    parsedHTMLObj.repeatItem = child.parsedHTMLObj;
                }
            }

        };

        var compileWatch = function(item, watch){
            item.attributes = $.extend(true,{},item.baseAttributes);
            var $el = watch.compile.call(item, {
                change: {
                    object: scope
                },
                $el: $parent,
                type: watch.type,
                name: watch.name,
                item: item,
                guid: guid,
                children: children
            });
            delete item.attributes;
            // this is in the case of a replacement
            if ($el) $parent = $el;
            delete customCompiles[watch.name];
        };

        // this only allows for one directive per element -- make more robust later
        // get the compiles that need to happen
        var customCompiles = {};
        for (var i=0; i<parsedHTMLObj.watchList.length; i++){
            var watch = parsedHTMLObj.watchList[i];
            if (watch.custom && watch.compile) customCompiles[watch.name] = watch;
        }

        var observers = [];
        for (var key in parsedHTMLObj.paths) {
            (function(path){
                var observer = new PathObserver(scope, path);
                var watchInds = parsedHTMLObj.paths[path];
                var watches = [];
                var val = Path.get(path).getValueFrom(scope);
                var item = parsedHTMLObj.item;

                for (var i=0; i<watchInds.length; i++){
                    watches.push(parsedHTMLObj.watchList[watchInds[i]]);
                    // call the compile function for non-custom directives
                    watches[i].compile && compileWatch(item, watches[i]);
                };

                var callback = function(newValue, oldValue, splices){
                    //console.log("path changed", path, newValue, oldValue);
                    item.attributes = $.extend(true,{},item.baseAttributes);
                    for (var i=0; i<watches.length; i++){
                        watches[i].watch.call(item, {
                            change: {
                                object: scope
                            },
                            $el: $parent,
                            type: watches[i].type,
                            name: watches[i].name,
                            item: item,
                            guid: guid,
                            splices: splices
                        });
                    }
                    delete item.attributes;
                };
                observer.open(callback);

                observers.push({
                    observer: observer,
                    callback: callback
                });

                if ($.isArray(val)){
                    var aObs = new ArrayObserver(val);
                    aObs.open(function(splices){
                        callback("","",splices);
                    });
                    observers.push({
                        observer: aObs,
                        callback: callback
                    });

                }else if (typeof val === "object"){
                    console.log("observe object", path);
                    /*
                     var objObs = new ObjectObserver(val);
                     objObs.open(function(added, removed, changed, getOldValueFn){
                     console.log("object changed", added, removed, changed);
                     console.log("object changed scope", scope);
                     // do the same as above
                     });
                     observers.push(objObs);
                     */
                }
            })(key);

        }
        // if the element was cloned, then we need to fire a change
        if (cloned){
            for (var i=0; i<observers.length; i++){
                observers[i].callback();
            }
        }

        var rObj = {
            $el: $parent,
            observers: observers,
            children: children,
            guid: guid,
            nodeType: nodeType,
            parentGuid: parentGuid,
            scope: scope
        };

        if (parsedHTMLObj.inRepeat && !parsedHTMLObj.comment && !repeatItem){
            rObj.parsedHTMLObj = parsedHTMLObj;
        };

        if (parsedHTMLObj.isRepeat){
            rObj.repeatItem = parsedHTMLObj.repeatItem;
            rObj.commentGuid = commentGuid;
        }

        // record the scope and put it into the scopemap
        this.setScopeObj(rObj);
        ($parent[0] || $parent)._vpGUID = guid;


        // After we've added the element to the scope map, run the custom directives which may have
        // more observers etc
        if (($parent[0] || $parent).nodeType === 1){
            // if it's actually an element, compile the custom directive
            for (var key in customCompiles){
                compileWatch(parsedHTMLObj, customCompiles[key]);
            }
        }

        var nodeType = ($parent[0] || $parent).nodeType;
        rObj.nodeType = nodeType;

        return rObj;
    };


    viewParser.prototype.removeElement = function(guid) {
        var o = _scopeMap[guid];
        if (!o) return;

        for (var i=0; i< o.observers.length; i++){
            o.observers[i].observer.close();
        };

        for (var child in o.children){
            this.removeElement(child);
        };
        try {
            o.$el.remove();
        } catch (e) {

        }
        // remove from the parent
        if (o.parentGuid) delete _scopeMap[o.parentGuid].children[guid];
        // remove from the scopeMap
        delete _scopeMap[guid];
    };

    viewParser.prototype.getScopeObj = function(guid) {
        return _scopeMap[guid];
    };

    viewParser.prototype.getScopeFromElement = function(el) {
        if (!el) return;
        var vpGUID = el._vpGUID;
        if (!vpGUID)  {
            return this.getScopeFromElement(el.parentNode);
        }
        var scopeObj = this.getScopeObj(vpGUID);
        return scopeObj ? scopeObj.scope : undefined;
    };

    viewParser.prototype.setScopeObj = function(obj, guid){
        guid = guid || obj.guid;
        if (!guid) return;
        _scopeMap[guid] = obj;
        return obj;
    };

    viewParser.prototype.getPaths = function(tokens){
        var keys = [];
        for (var i=0; i<tokens.length; i++){
            !tokens[i].hasOwnProperty('json') && keys.push(tokens[i].text);
        }
        return keys;
    };

    // set up
    var _vp = function(){
        this.customDirectives = {};
    };

    _vp.prototype.addCustomDirective = function(name, directive){
        name = name.replace(/\./g, "-").replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();});
        this.customDirectives[name] = {
            directive: directive,
            parsedHTMLObj: undefined
        };
    };

    _vp.prototype.parse = function(html){
        return new viewParser(html, this.customDirectives);
    };

    _vp.prototype.getScopeObj = function(guid){
        return _scopeMap[guid];
    };

    _vp.prototype.getScopeFromElement = function(el){
        if (!el) return;
        var vpGUID = el._vpGUID;
        if (!vpGUID)  {
            return this.getScopeFromElement(el.parentNode);
        }
        var scopeObj = this.getScopeObj(vpGUID);
        return scopeObj ? scopeObj.scope : undefined;
    };

    window[name+"Class"] = viewParser;
    window[name] = _vp;
})(name);