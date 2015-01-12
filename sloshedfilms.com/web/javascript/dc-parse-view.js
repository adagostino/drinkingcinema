var name = "viewParser";
(function(name){
    var ngReg = new RegExp("^dc-","i"),
        semiReg = new RegExp(";$"),
        startTag = /<([-A-Za-z0-9_]+)((?:\s+[-A-Za-z0-9_]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/g,
        endTag = /<\/([-A-Za-z0-9_]+)[^>]*>/g,
        $parse = window.ngParser;

    var _scopeMap = {};

    var _vp = new function(){
        this.customDirectives = {};

        this.addCustomDirective = function(name, directive){
            name = name.replace(/\./g, "-").replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();});
            this.customDirectives[name] = directive;
        };

        this.parse = function(html) {
            return new _viewParser(html, this.customDirectives);
        }
    };

    function _viewParser(html, customDirectives){
        var _template = html,
            _customDirectives = customDirectives || {},
            _viewObj = _parseTemplate(_template, _customDirectives),
            _self = this,
            _parsedObj;

        var _compile = function (obj, $parent) {
            var addParent = !obj.$parent && $parent;
            var addWindow = !obj.window;
            if (addParent) obj.$parent = $parent;
            if (addWindow) obj.window = window;
            var view = _viewObj.compile(obj);
            if (addParent) delete obj.$parent;
            if (addWindow) delete obj.window;
            return view;
        }

        this.getHTML = this.getHtml = function(obj, $parent){
            var o = _compile(obj, $parent);
            return _compileHTMLStr(o);
        };

        this.getElement = function(obj, $parent, bind){
            bind = typeof bind === "boolean" ? bind : true;
            if (!_parsedObj) _parsedObj = _viewObj.compile(obj);

            if (!bind) return $(this.getHTML(obj, $parent));

            var parsedHTMLObj = _compileHTMLEl(_parsedObj, obj),
                $el = parsedHTMLObj.$el,
                nodeType = ($el[0] || $el).nodeType;
            // if it's a document fragment, return its child nodes
            return nodeType === 11 ? $($el.childNodes) : $el;
        };

    }

    function _getEl(tag, attrs, unary, customDirectives){
        var parsedAttrs = _parseAttributes(attrs, customDirectives);
        // order the directives so repeat is first, then if, then everything else
        var directives = [];
        parsedAttrs.repeat && directives.push({name: "repeat", value: parsedAttrs.repeat}) && delete parsedAttrs.repeat;
        parsedAttrs.if && directives.push({name: "if", value: parsedAttrs.if}) && delete parsedAttrs.if;
        for (var key in parsedAttrs.directives){
            directives.push({
                name: key,
                value: parsedAttrs.directives[key]
            });
        }
        return {
            start: tag ? "<" + tag : "",
            children: [],
            end: unary ? "" : (tag ? "</" + tag + ">" : ""),
            unary: unary,
            directives: directives,
            baseAttributes: parsedAttrs ? parsedAttrs.attributes  || [] : [],
            watches: parsedAttrs ? parsedAttrs.watches || {} : {},
            tag: tag,
            compile: function(o, inRepeat){
                inRepeat = typeof inRepeat === "boolean" ? inRepeat : false;
                this.attributes = $.extend(true,{},this.baseAttributes);
                var str = this.start;

                for (var i=0; i<this.directives.length; i++){
                    var directive = this.directives[i];
                    if (directive.name === "repeat"){
                        if (!inRepeat) {
                            //console.log("ng repeat");
                            var children = directive.value.call(this, o);
                            delete this.attributes;
                            return children;
                        }
                    }else if (directive.name === "if") {
                        if (!directive.value.call(this, o)) {
                            var open = this.start + " dc-if='" + this.watches.directives[directive.name].oValue + "' " + (this.unary ? " />" : ">");
                            return {
                                str: "",
                                comment: true,
                                openTag: open,
                                closeTag: this.end,
                                item: this,
                                html: "<!-- " + open + this.end + " -->",
                                children: []
                            };
                        }
                    }else{
                        var val = directive && typeof directive.value === "function" ? directive.value.call(this,o) : "";
                        str+= typeof val === "string" ? val : "";
                    }
                }

                for (var key in this.attributes){
                    str+=' ' + key + '= "';
                    for (var j=0; j<this.attributes[key].length; j++){
                        str+= typeof this.attributes[key][j] === "function" ? this.attributes[key][j](o) : this.attributes[key][j];
                    }
                    str+='"';
                }
                if (this.start) {
                    str += this.unary ? " />" : ">";
                }
                var openTag = str;

                // now get the children;
                var children = [],
                    childrenStr = "";
                for (var i=0; i<this.children.length; i++){
                    if (typeof this.children[i].compile === "function"){
                        var child = this.children[i].compile(o);
                        children.push(child);
                        childrenStr+=child.html;
                    }else{
                        var child = "";
                        for (var j=0; j<this.children[i].length; j++){
                            child += typeof this.children[i][j] === "function" ? this.children[i][j].call(this, o) : this.children[i][j];
                        }
                        children.push(child);
                        childrenStr+=child;
                    }
                }
                str+= this.end;
                !inRepeat && delete this.attributes;

                //console.log(children, this);
                var obj = {
                    html: openTag + childrenStr + this.end,
                    str: str,
                    openTag: openTag,
                    closeTag: this.end,
                    item: this,
                    children: children
                };
                if (inRepeat) obj.inRepeat = true;
                return obj;
            }
        }
    };

    function _compileHTMLStr (parsedHTMLObj) {
        return parsedHTMLObj.html;
    };

    function _compileHTMLEl (parsedHTMLObj, scope, repeatItem, parentGuid) {
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
            if (!parsedHTMLObj.item) console.log(parsedHTMLObj);
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
            var child = _compileHTMLEl(parsedHTMLObj.children[i], scope, parsedHTMLObj.repeatItem, guid);
            if (typeof child === "string") {
                if (!parsedHTMLObj.str) $parent = $(document.createTextNode(child));
            } else {
                try {
                    $parent.append(child.$el);
                } catch(e) {
                    $parent.appendChild(child.$el[0]);
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
                //console.log(path, guid);
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
                    //console.log("############ observe array", path, ect, guid);
                    var aObs = new ArrayObserver(val);
                    aObs.open(function(splices){
                        callback("","",splices);
                    });
                    observers.push({
                        observer: aObs,
                        callback: callback
                    });
                }else if (typeof val === "object"){
                    //console.log("observe object", path);
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
        for (var key in customCompiles){
            compileWatch(parsedHTMLObj, watch);
        }
        var nodeType = ($parent[0] || $parent).nodeType;

        var rObj = {
            $el: $parent,
            observers: observers,
            children: children,
            guid: guid,
            nodeType: nodeType,
            parentGuid: parentGuid
        };
        if (parsedHTMLObj.inRepeat && !parsedHTMLObj.comment && !repeatItem){
            rObj.parsedHTMLObj = parsedHTMLObj;
        };
        if (parsedHTMLObj.isRepeat){
            rObj.repeatItem = parsedHTMLObj.repeatItem;
            rObj.commentGuid = commentGuid;
        }

        // if it's actually an element, record it
        if (_scopeMap[guid]){
            console.log("it already exists", nodeType, _scopeMap[guid].nodeType);
            //console.log("it already exits", guid, _scopeMap[guid])
        }
        _scopeMap[guid] = rObj;
        ($parent[0] || $parent)._vpGUID = guid;

        return rObj;
    };

    function _parseTemplate(html, customDirectives){
        var el = _getEl(),
            currEl = el,
            ct = [],
            parseCt = function(ct,el){
                var str = ct.length ? "children["+ct.join("].children[") +"]" : "";
                return str ? $parse(str)(el) : el;
            };

        HTMLParser(html,{
            start: function(tag, attrs, unary){
                var nEl = _getEl(tag, attrs, unary, customDirectives);
                currEl.children.push(nEl);

                nEl.parent = currEl;
                if (currEl.children.length > 1) {
                    currEl.children[currEl.children.length - 2].next = nEl;
                    nEl.prev = currEl.children[currEl.children.length - 2];
                }

                if (!unary){
                    ct.push(currEl.children.length - 1);
                    currEl = nEl;
                }
            },
            end: function(tag){
                currEl.end = "</" + tag + ">";
                ct.pop();
                currEl = parseCt(ct,el);
            },
            chars: function(text){
                if ($.trim(text)) {
                    var pt = _parseText(text, true);
                    var nEl = _getEl();
                    nEl.children.push(pt.link);
                    if (pt.watch) {
                        nEl.watches["text"] = {
                            watch: function (o) {
                                var str = "",
                                    $el = o.$el;

                                for (var i = 0; i < this.children.length; i++) {
                                    for (var j = 0; j < this.children[i].length; j++) {
                                        str += typeof this.children[i][j] === "function" ? this.children[i][j].call(this, o.change.object) : this.children[i][j];
                                    };
                                }
                                if ($el && $el.text() !== str) {
                                    if ($el[0].nodeType === 3) {
                                        $el[0].textContent = str;
                                    } else {
                                        $el.html(str);
                                    }
                                }
                            },
                            paths: pt.paths,
                            oValue: text
                        };
                    }
                    currEl.children.push(nEl);
                    nEl.parent = currEl;
                    if (currEl.children.length > 1) {
                        currEl.children[currEl.children.length - 2].next = nEl;
                        nEl.prev = currEl.children[currEl.children.length - 2];
                    }
                }
            },
            comment: function(text){

            }
        });
        return el;
    };

    function _parseAttributes(attrs, customDirectives){
        attrs = attrs || [];
        var obj = {
            directives: {},
            attributes: {},
            watches: {
                directives: {},
                attributes: {}
            }
        };

        for (var i=0; i<attrs.length; i++){
            var o = attrs[i];
            if (ngReg.test(o.name)){
                obj.attributes[o.name] = [o.value];
                var name = o.name.toLowerCase().replace(ngReg,"");
                var pd = _parseDirective(name, o.value, customDirectives);
                obj.directives[name] = pd.link;

                obj.watches.directives[name] = {
                    watch: pd.watch,
                    compile: pd.compile,
                    paths: pd.paths,
                    oValue: o.value,
                    custom: !!pd.custom
                };
            } else {
                var value = $.trim(o.value);
                switch(o.name.toLowerCase()){
                    case "style":
                        value += semiReg.test(value) ? "" : ";";
                        break;
                    default:
                        break;
                }

                var pa = _parseText(value);
                obj.attributes[o.name.toLowerCase()] = pa.link;
                (function(o) {
                    if (pa.watch) obj.watches.attributes[o.name] = {
                        watch: function (o) {
                            var str = "",
                                key = o.name,
                                $el = o.$el;
                            for (var j=0; j<this.attributes[key].length; j++){
                                str+= typeof this.attributes[key][j] === "function" ? this.attributes[key][j](o.change.object) : this.attributes[key][j];
                            }
                            $el && $el.attr(key) !== str && $el.attr(key, str);
                        },
                        paths: pa.paths,
                        oValue: value
                    };
                })(o);
            }
        }

        return obj;
    };

    var _events = {
        'input': 'input',
        'change': 'change',
        'keyup': 'keyup',
        'keydown': 'keydown',
        'click': 'click',
        'mouseup': 'mouseup',
        'mousedown': 'mousedown',
        'focus': 'focus',
        'blur': 'blur',
        'load': 'load'
    };

    function _parseDirective(name,value, customDirectives){
        customDirectives = customDirectives || {};
        switch(name){
            case "class":
                // push each key / value into this.attributes.class array
                return _parseClassDirective(value);
                break;
            case "if":
                return _parseIfDirective(value);
                break;
            case "repeat":
                return _parseRepeatDirective(value);
                break;
            case  "style":
                return _parseStyleDirective(value);
                break;
            case "include":
                return _parseIncludeDirective(value, customDirectives);
                break;
            case "model":
                return _parseModelDirective(value);
                break;
            default:
                if (_events[name]) {
                    return _parseListenDirective(value, _events[name]);
                } else if (customDirectives[name]) {
                    return _parseCustomDirective(value, name, customDirectives);
                } else {
                    name !== "controller" && console.warn("could not parse '",name, ".' Have you added the directive to your code yet?");
                }
                return {};
                break;
        }
    };

    function _parseText(str,clean){
        clean = typeof clean === "boolean" ? clean : false;
        var a = [],
            lastIdx = 0,
            watch = false,
            paths = [];


        str.replace(/{{[^}}]+}}/ig,function(match,idx){
            a.push(str.substring(lastIdx,idx));
            watch = true;
            var tMatch = match.replace(/({|})/g,"");

            var parseFunc = $parse(tMatch);
            var tPaths = getPaths(parseFunc.lexer.lex(tMatch));
            paths = paths.concat(tPaths);
            a.push(function(o){
                //todo: see if we need to clean html out of this
                return clean ? _clean(parseFunc(o)) : parseFunc(o);
            });
            lastIdx = idx + match.length;
        });
        lastIdx < str.length && a.push(str.substring(lastIdx,str.length));

        var ro = {
            link: a,
            watch: watch,
            paths: paths
        };

        return ro;

    };

    function _clean(str, doItRight){
        if (typeof str !== "string") {
            if (typeof str === "null" || typeof str === "undefined") return "";
            try {
                str = JSON.stringify(str);
            } catch(e) {
                return ""
            }
        }

        doItRight = typeof doItRight === "boolean" ? doItRight : false;
        var str2 = "";
        if (doItRight) {
            HTMLParser(str, {
                chars: function (txt) {
                    str2 += txt;
                }
            });
        } else {
            str2 = str.replace(startTag, "").replace(endTag, "");
        }
        return str2;
    }

    function _getLength(o){
        try{
            if ($.isArray(o)) return o.length;
            var ct = 0;
            for (var key in o) ct++;
            return ct;
        }catch(e){
            console.error("Could not get length of " + o + ". Please use a proper array or object or string for ng-repeat");
            return 0;
        }
    };

    function _removeElement(guid){
        var o = _scopeMap[guid];
        if (!o) return;

        for (var i=0; i< o.observers.length; i++){
            o.observers[i].observer.close();
        };

        for (var child in o.children){
            _removeElement(child);
        };
        try {
            o.$el.remove();
        } catch (e) {

        }
        // remove from the parent
        if (o.parentGuid) delete _scopeMap[o.parentGuid].children[guid];
        // remove from the scopeMap
        delete _scopeMap[guid];

    }

    function _parseRepeatDirective(value){
        var list = value.match(/(?:\s*in\s*)([-A-Za-z0-9_\.]+)\s*/i)[1],
            keyMatch = value.match(/(?:\s*)\(*([-A-Za-z0-9_]+)(?:\s*\,*\s*)([-A-Za-z0-9_]+)*\)*(?:\s+in)/i),
            key = keyMatch[1],
            val = keyMatch[2],
            parseFunc = $parse(list);
        var paths = getPaths(parseFunc.lexer.lex(list));

        var dcRepeatItems = [],
            compiled = false;

        return {
            link: function(o){
                var a = parseFunc(o),
                    isObject = typeof a === "object" && !$.isArray(a),
                    str = "",
                    length = _getLength(a),
                    ct = 0,
                    open = this.start + " dc-repeat='" + this.watches.directives.repeat.oValue + "' " + (this.unary ? " />" : ">"),
                    robj = {
                        html: str,
                        str: "",
                        openTag: "",
                        closeTag: "",
                        item: this,
                        isRepeat: true,
                        children: [
                            {
                                str: "",
                                comment: true,
                                openTag: open,
                                closeTag: this.end,
                                item: this,
                                html: "<!-- " + open + this.end + " -->",
                                inRepeat: true,
                                children: []
                            }
                        ]

                    };
                    // the comment above is used as a placeholder so we always know where to insert elements

                if (!length) return robj;
                //console.log("in repeat link", this);
                for (var i in a){
                    // need to compile element for a[i] but not re-run repeat, also need to set $parent
                    var io = {};
                    io.parentScope = o;
                    io.repeatIndex = ct;
                    io.repeatFirst = ct === 0;
                    io.repeatLast = ct === length - 1;
                    io.repeatMiddle = !io.repeatFirst && !io.repeatLast;
                    io.repeatEven = !!(ct%2);
                    io.repeatOdd = !io.repeatEven;

                    io[key] = isObject ? i : a[i];
                    if (val) io[val] = a[i];
                    dcRepeatItems.push({
                        io: io
                    });

                    var child = this.compile(dcRepeatItems[i].io, true);
                    child.repeatScope = dcRepeatItems[i].io;

                    str+=child.html;
                    robj.children.push(child);
                    ct++;
                }
                robj.html = str;

                return robj;
            },
            compile: function(o){
                var nodeType = (o.$el[0] || o.$el).nodeType,
                    $el = nodeType === 11 ? $(o.$el.childNodes) : o.$el;
                $el.children().each(function(idx){
                    dcRepeatItems[idx].guid = this._vpGUID;
                    //console.log(this, this._vpGUID);
                });
                //console.log(dcRepeatItems);
            },
            watch: function(o) {
                var splices = o.splices,
                    guid = o.guid;

                // get information about the changed object
                var a = parseFunc(o.change.object),
                    length = _getLength(a),
                    isObject = typeof a === "object" && !$.isArray(a);

                var parent = _scopeMap[guid];
                // if !o.splices, then it's a whole new array and needs to be completely
                // rebuilt j -- so fake out that splices array, brah!

                if (!splices) {
                    splices = [
                        {
                            addedCount: length,
                            index: 0,
                            removed: length ? [] : dcRepeatItems
                        }
                    ];
                };

                var changed = [], removed = [], added = [];
                for (var i=0; i<splices.length; i++){
                    var idx = splices[i].index,
                        numAdded = splices[i].addedCount,
                        numRemoved = splices[i].removed.length;

                    // start with removed
                    for (var j=0; j<numRemoved; j++){
                        if (j < numAdded){
                            changed.push(idx + j);
                        } else {
                            removed.push(idx + j);
                        }
                    }
                    var lastChangedIdx = changed[changed.length - 1] || idx;
                    for (var j = 0; j < (numAdded - numRemoved); j++){
                        added.push(lastChangedIdx + j + (numRemoved ? 1 : 0));
                    }

                };

                for (var i=0; i<added.length; i++){
                    var ct = added[i];
                    var io = {};
                    io.parentScope = o.change.object;
                    io[key] = isObject ? ct : a[ct]; // item of "item in items" -- so the actual child object
                    if (val) io[val] = a[i];
                    var childParsedHTML = this.compile(io, true);

                    var addedObj = _compileHTMLEl(childParsedHTML, io, parent.repeatItem);
                    _scopeMap[addedObj.guid] = addedObj;
                    var prevGuid;
                    if (ct <= 0) {
                        ct = 0;
                    } else if (ct > dcRepeatItems){
                        ct = dcRepeatItems.length;
                    }
                    parent.children[addedObj.guid] = {
                        type: (addedObj.$el[0] || addedObj.$el).nodeType
                    };
                    //parent.children.splice(ct,0,addedObj.guid);
                    // now add it into the dom
                    var prevGuid = ct - 1 > -1 ? dcRepeatItems[ct - 1].guid : parent.commentGuid;

                    _scopeMap[prevGuid].$el.after(addedObj.$el);
                    dcRepeatItems.splice(ct, 0, {
                        io: io,
                        guid: addedObj.guid
                    });

                }

                for (var i=0; i<changed.length; i++) {
                    var ct = changed[i];
                    //var changedObj = _scopeMap[parent.children[ct]];
                    var io = {};
                    io.parentScope = o.change.object;
                    dcRepeatItems[ct].io[key] = isObject ? ct : a[ct];
                    if (val) dcRepeatItems[ct].io[val] = a[i];
                }

                for (var i=0; i<removed.length; i++) {
                    var ct = removed[i] - i;
                    _removeElement(dcRepeatItems[ct].guid);
                    dcRepeatItems.splice(ct,1);
                }

                // at the end, run through all of the items in the array and change them accordingly -- may be expensive
                // depending on what you're doing -- adding classes based on even or odd could be rotten
                for (var i=0; i<dcRepeatItems.length; i++){
                    var io = dcRepeatItems[i].io;
                    io.repeatIndex = i;
                    io.repeatFirst = i === 0;
                    io.repeatLast = i === length - 1;
                    io.repeatMiddle = !io.repeatFirst && !io.repeatLast;
                    io.repeatEven = !!(i%2);
                    io.repeatOdd = !i.repeatEven;
                }

            },
            paths: paths
        }
    };

    function _parseIfDirective(value) {
        var parseFunc = $parse(value);
        var paths = getPaths(parseFunc.lexer.lex(value));
        return {
            link: function(o){
                return !!parseFunc(o);
            },
            watch: function(o){
                //console.log("this causes a memory leak b/c i don't unobserve", o.$el[0].nodeType, o.$el[0]);
                if (o.$el[0].nodeType === 8 && !!parseFunc(o.change.object)){
                    // add item
                    var cO = this.compile(o.change.object);
                    var $ifEl = _compileHTMLEl(cO, o.change.object);
                    o.$el.replaceWith($ifEl.$el);
                } else if (o.$el[0].nodeType !==8 && !parseFunc(o.change.object)){

                    var cObj = {
                        str: "",
                        comment: true,
                        openTag: this.start + " ng-if='" + this.watches.directives["if"].oValue + "' " + (this.unary ? " />" : ">"),
                        closeTag: this.end,
                        item: this,
                        children: {}
                    };
                    var cO = this.compile(o.change.object);
                    var $c = _compileHTMLEl(cO, o.change.object);
                    o.$el.replaceWith($c.$el);
                    _removeElement(o.guid);

                }
            },
            paths: paths
        }
    };

    function _parseClassDirective(value) {
        //todo: make more robust and check if class already exists
        var parseFunc = $parse(value);
        var paths = getPaths(parseFunc.lexer.lex(value));
        return {
            link: function(o){
                //console.log(this);
                if (!this.attributes["class"]) this.attributes["class"] = [];
                var classes = parseFunc(o);
                for (var key in classes){
                    if (classes[key]) {
                        this.attributes["class"].length && this.attributes["class"].push(" ");
                        this.attributes["class"].push(key);
                    }
                }
            },
            watch: function(o){
                if (!this.attributes["class"]) this.attributes["class"] = [];
                var classes = parseFunc(o.change.object);
                for (var key in classes){
                    if (classes[key]) {
                        this.attributes["class"].length && this.attributes["class"].push(" ");
                        this.attributes["class"].push(key);
                        o.$el.addClass(key);
                    }else{
                        o.$el.removeClass(key);
                    }
                }
            },
            paths: paths
        }
    };

    function _parseStyleDirective(value){
        //todo: make more robust and check if style already exists
        var parseFunc = $parse(value);
        var paths = getPaths(parseFunc.lexer.lex(value));

        return {
            link: function (o) {
                if (!this.attributes["style"]) this.attributes["style"] = [];
                var styles = {};
                try{
                    styles = parseFunc(o);
                }catch(e){
                    console.error('could not parse:"',value,'" -- if the key has a hyphen in it, ala margin-left, make sure you put single quotes around it (or make it camel case)');
                }
                for (var key in styles) {
                    this.attributes["style"].length && this.attributes["style"].push(" ");
                    this.attributes["style"].push(key + ": " + styles[key] + ";");
                }
            },
            watch: function (o) {
                if (!this.attributes["style"]) this.attributes["style"] = [];
                var styles = {};
                try{
                    styles = parseFunc(o.change.object);
                }catch(e){
                    console.error('could not parse:"',value,'" -- if the key has a hyphen in it, ala margin-left, make sure you put single quotes around it (or make it camel case)');
                }
                for (var key in styles) {
                    this.attributes["style"].length && this.attributes["style"].push(" ");
                    this.attributes["style"].push(key + ": " + styles[key] + ";");
                    o.$el.css(key, styles[key] || "");
                }
            },
            paths: paths
        }
    };

    function _parseIncludeDirective(value, customDirectives){
        var parseFunc;
        try {
            parseFunc = $parse(value);
        } catch (e) {

        }
        //var template = $(value).html();
            //vO = _parseTemplate(template);

        return {
            link: function(o){
                var templateId = parseFunc ? parseFunc(o) : value,
                    template = $(templateId).html(),
                    vO = _parseTemplate(template, customDirectives);
                this.children = vO.start ? [vO] : vO.children;
            },
            watch: function(o){

                console.log(this, o);
                console.log("include watch");
            }
        }

    };

    var _getScopeOfFunction = function(obj, value){
        var scope = obj;
        var va = value.split(".");
        va.pop();
        var done = false;
        while (va.length > 0 && !done){
            var ts = Path.get(va.join(".")).getValueFrom(obj);
            if (ts.$dcType) {
                scope = ts;
                done = true;
            } else {
                va.pop();
            }
        }
        return scope;
    }

    var _setListener = function(o, type, parseFunc, value, fn){
        var $el = o.$el,
            name = "dc-" + type + "-" + value,
            oldFn = $el.data(name);
        if (oldFn){
            $el.off(type, "div, span", oldFn);
            $el.data(name, null);
        }
        var callback = fn || parseFunc(o.change.object);
        if (typeof callback !== "function") return;

        var fn = function(){
            var scope = _getScopeOfFunction(o.change.object, value);
            callback.apply(scope, arguments);
            Platform.performMicrotaskCheckpoint();
        };
        $el.data(name, fn);
        $el.on(type, fn);
    };

    function _parseListenDirective(value, type){
        var parseFunc = $parse(value),
            paths = getPaths(parseFunc.lexer.lex(value));

        return {
            link: function(o) {

            },
            compile: function(o) {
                _setListener(o, type, parseFunc, value);
            },
            watch: function(o) {
                _setListener(o, type, parseFunc, value);
            },
            paths: paths
        }
    };

    function _parseModelDirective(value){
        var parseFunc = $parse(value),
            paths = getPaths(parseFunc.lexer.lex(value));
        return {
            link: function(o) {
                var val = parseFunc(o);
                if (this.tag === "input" || this.tag === "textarea"){
                    this.attributes['value'] = [val || ""];
                } else {
                    var vO = _parseTemplate(val);
                    var a = vO.start ? [vO] : vO.children;
                    this.children = this.children.concat(a);
                }

            },
            compile: function(o) {
                // set up a listener
                var fn = this.tag === "input" || this.tag === "textarea" ? "val" : "html";
                _setListener(o, "input", parseFunc, value, function(){
                    Path.get(value).setValueFrom(this, o.$el[fn]());
                    //this[value] = o.$el[fn]();
                });
            },
            watch: function(o) {
                var val = parseFunc(o.change.object),
                    fn = this.tag === "input" || this.tag === "textarea" ? "val" : "html";
                o.$el[fn]() !== val && o.$el[fn](val || "");
            },
            paths: paths
        }
    };

    function _parseCustomDirective(value, name, customDirectives) {
        // value is the scope, if it exists
        var parseFunc = $parse(value),
            paths = getPaths(parseFunc.lexer.lex(value)),
            dir = customDirectives[name];

        return {
            link: function(o) {
                // don't do anything -- only do something on compile
            },
            compile: function(o) {

                var val = parseFunc(o.change.object);
                var $scope = val || o.change.object;
                if (val)  $scope.parentScope = o.change.object;

                // run the init function of the directive
                $scope.$el = o.$el;
                var dirScope = typeof dir.directive.init === "function" && dir.directive.init($scope, true);

                var template = typeof dir.template === "function" ? dir.template.apply(this) : dir.template;
                var replace = false;
                if (!template) {
                    template = o.$el.clone().removeAttr("dc-"+ name).attr("clone", true)[0].outerHTML;
                    replace = true;
                }

                var vO = _parseTemplate(template, customDirectives);
                var c = vO.compile($scope);
                var child = _compileHTMLEl(c, dirScope);

                if (!replace) {
                    try {
                        o.$el.append(child.$el);
                    } catch(e) {
                        o.$el.appendChild(child.$el[0]);
                    }//(nodeType === 1 || nodeType === 3) && o.children.push(child.guid);
                } else {
                    console.log("probably should be copying data and event handlers over here", value, name);
                }
                var nodeType = (child.$el[0] || child.$el).nodeType;
                o.children[child.guid] = {
                    type: nodeType
                };
                typeof dirScope.init === "function" && dirScope.init.call(dirScope);
                return replace ? child.$el : undefined;
            },
            watch: function(o) {
                console.log("in watch?");
            },
            paths: paths,
            custom: true
        }
    }

    function getPaths(tokens){
        var keys = [];
        for (var i=0; i<tokens.length; i++){
            !tokens[i].hasOwnProperty('json') && keys.push(tokens[i].text);
            //!tokens[i].hasOwnProperty('json') && console.log(tokens[i]);
        }
        return keys;
    };

    $dc[name] = _vp;
})(name);