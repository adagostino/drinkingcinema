var name = "parseView";
(function(name){
    var ngReg = new RegExp("^dc-","i"),
        semiReg = new RegExp(";$"),
        startTag = /<([-A-Za-z0-9_]+)((?:\s+[-A-Za-z0-9_]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/g,
        endTag = /<\/([-A-Za-z0-9_]+)[^>]*>/g,
        $parse = window.ngParser;

    var _scopeMap = {};

    var _vp = function(html){
        return new _viewParser(html);
    };

    function _viewParser(html){
        var _template = html,
            _viewObj = _parseTemplate(_template),
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

            var parsedHTMLObj = _compileHTMLEl(_parsedObj, obj, $parent);
            var $el = parsedHTMLObj.$el;
            if ($el.context.nodeType !== 11) return $el;

            var a = [];
            for (var i=0; i<parsedHTMLObj.children.length; i++){
                var child = _scopeMap[parsedHTMLObj.children[i]];
                a.push(child.$el);
            };
            return a[0];
        };

    }

    function _getEl(tag, attrs, unary){
        var parsedAttrs = _parseAttributes(attrs);
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
                            var open = this.start + " ng-if='" + this.watches.directives[directive.name].oValue + "' " + (this.unary ? " />" : ">");
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

    function _compileHTMLEl (parsedHTMLObj, scope) {
        if (typeof parsedHTMLObj === "string") return parsedHTMLObj;
        // need concept of $prev and $next and $parent for each element
        var $parent;
        var $oEl;
        var cloned = false;
        if (parsedHTMLObj.isRepeat){
            console.log(parsedHTMLObj);
        }
        if (parsedHTMLObj.$el) {
            $parent = $(parsedHTMLObj.$el[0].cloneNode(false));
            cloned = true;
        } else {
            $parent = parsedHTMLObj.str ? $(parsedHTMLObj.str) : parsedHTMLObj.comment ? $(document.createComment(parsedHTMLObj.openTag + parsedHTMLObj.closeTag)) : $(document.createDocumentFragment());
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
                            compile: obj[key].compile
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

        var children = [];
        var ct = 0;
        for (var i=0; i<parsedHTMLObj.children.length; i++){
            var child = _compileHTMLEl(parsedHTMLObj.children[i], scope);
            if (typeof child === "string") {
                if (!parsedHTMLObj.str) $parent = $(document.createTextNode(child));
            } else {
                $parent.append(child.$el);
                child.$el[0].nodeType === 1 && children.push(child.guid);
            }
        };

        var observers = [];
        var guid = generateGUID(16,true);
        for (var key in parsedHTMLObj.paths) {
            (function(path){
                var observer = new PathObserver(scope, path);
                var watchInds = parsedHTMLObj.paths[path];
                var watches = [];
                var val = Path.get(path).getValueFrom(scope);
                //console.log(path, val);
                var item = parsedHTMLObj.item;

                for (var i=0; i<watchInds.length; i++){
                    watches.push(parsedHTMLObj.watchList[watchInds[i]]);
                    // call the compile function -- definitely better place to do it than here,
                    // but I'll do that later
                    watches[i].compile && (function(){
                        item.attributes = $.extend(true,{},item.baseAttributes);
                        watches[i].compile.call(item, {
                            change: {
                                object: scope
                            },
                            $el: $parent,
                            type: watches[i].type,
                            name: watches[i].name,
                            item: item
                        });
                        delete item.attributes;
                    })();
                };
                //console.log(path, watches.length);
                var callback = function(newValue, oldValue){
                    //console.log("path changed", path, newValue, oldValue);
                    //console.log(watches);
                    item.attributes = $.extend(true,{},item.baseAttributes);

                    for (var i=0; i<watches.length; i++){
                        watches[i].watch.call(item, {
                            change: {
                                object: scope
                            },
                            $el: $parent,
                            type: watches[i].type,
                            name: watches[i].name,
                            item: item
                        });
                    }
                    delete item.attributes;
                };
                observer.open(callback);

                observers.push(observer);

                if ($.isArray(val)){
                    console.log("observe array", path);
                    var aObs = new ArrayObserver(val);
                    aObs.open(function(splices){
                        //console.log("array changed", splices, val);
                        //console.log(watches);
                        for (var i=0; i<watches.length; i++){
                            watches[i].watch.call(item, {
                                change: {
                                    object: scope
                                },
                                $el: $parent,
                                type: watches[i].type,
                                name: watches[i].name,
                                item: item,
                                splices: splices
                            })
                        }
                    });
                    observers.push(aObs);
                }else if (typeof val === "object"){
                    console.log("observe object", path);
                    var objObs = new ObjectObserver(val);
                    objObs.open(function(added, removed, changed, getOldValueFn){
                        console.log("object changed", added, removed, changed);
                        console.log("object changed scope", scope);
                        // do the same as above
                    });
                    observers.push(objObs);
                }

            })(key);

        }

        var rObj = {
            $el: $parent,
            observers: observers,
            children: children,
            guid: guid
        }

        // if it's actually an element, record it
        //if ($parent[0].nodeType === 1){
            _scopeMap[guid] = rObj;
            $parent[0]._vpGUID = guid;
        //}
        return rObj;
    };

    function _observe(viewObj, $el, scope, execute){
        //var watchList = viewObj.watchList;
        var executeWatches = function(watchList) {
            //console.log(watchList);
            if (!watchList.list.length) return;
            //console.log(watchList, $el);
            var item = viewObj.item;
            item.attributes = $.extend(true,{},item.baseAttributes);

            for (var i=0; i<watchList.list.length; i++){
                var watchObj = watchList.list[i];

                watchObj.watch.call(item, {
                    change: watchList.change,
                    $el: $el,
                    type: watchObj.type,
                    name: watchObj.name,
                    item: item
                });
            }
            delete item.attributes;
        };

        var observeFunc = function(changes) {
            executeWatches(_compileWatches(changes, viewObj));
        };
        Object.observe(scope, observeFunc);

        if (execute) {
            var changes = [];
            for (var key in viewObj.paths){
                changes.push({
                    'name' : key,
                    'oldValue': undefined,
                    'newValue': scope[key],
                    'object': scope,
                    'type': "update"
                })
            };

            changes.length && executeWatches(_compileWatches(changes, viewObj));
        }
        // Object.unobserve(scope, observeFunc);
        //viewObj.observeFunc = observeFunc;


    }

    function _compileWatches(changes, viewObj) {
        var paths = viewObj.paths;
        var watches = viewObj.watchList;

        var change = {
            object: changes[0].object
        };

        var a = [];
        for (var i=0; i<changes.length; i++){
            if (paths[changes[i].name]){
                a = a.concat(paths[changes[i].name]);
                change[changes[i].name] = {
                    oldValue: changes[i].oldValue,
                    newValue: changes[i].object[changes[i].name], // use parse here later
                    type: changes[i].type
                }
            }
        }
        a.sort();
        var map = {};
        var b = [];
        for (var i=0; i < a.length; i++){
            if (!map[a[i]]){
                map[a[i]] = true;
                b.push(watches[a[i]]);
            }
        };

        return {
            change: change,
            list: b
        };
    };

    function _parseTemplate(html){
        var el = _getEl(),
            currEl = el,
            ct = [],
            parseCt = function(ct,el){
                var str = ct.length ? "children["+ct.join("].children[") +"]" : "";
                return str ? $parse(str)(el) : el;
            };

        HTMLParser(html,{
            start: function(tag, attrs, unary){
                var nEl = _getEl(tag, attrs, unary);
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

    function _parseAttributes(attrs){
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
                var pd = _parseDirective(name, o.value);
                obj.directives[name] = pd.link;

                obj.watches.directives[name] = {
                    watch: pd.watch,
                    compile: pd.compile,
                    paths: pd.paths,
                    oValue: o.value
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
        'keyup': 'keyup',
        'keydown': 'keydown',
        'click': 'click',
        'mouseup': 'mouseup',
        'mousedown': 'mousedown',
        'focus': 'focus',
        'blur': 'blur'
    }

    function _parseDirective(name,value){
        //console.log(attr);
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
                return _parseIncludeDirective(value);
                break;
            case "model":
                return _parseModelDirective(value);
                break;
            default:
                return _events[name] ? _parseListenDirective(value, _events[name]) : undefined;
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
        if (typeof str !== "string") return "";
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

    function _parseRepeatDirective(value){
        var list = value.match(/(?:\s*in\s*)([-A-Za-z0-9_\.]+)\s*/i)[1],
            keyMatch = value.match(/(?:\s*)\(*([-A-Za-z0-9_]+)(?:\s*\,*\s*)([-A-Za-z0-9_]+)*\)*(?:\s+in)/i),
            key = keyMatch[1],
            val = keyMatch[2],
            parseFunc = $parse(list);
        var paths = getPaths(parseFunc.lexer.lex(value));

        return {
            link: function(o){
                var a = parseFunc(o),
                    isObject = typeof a === "object" && !$.isArray(a),
                    str = "",
                    children = [],
                    length = _getLength(a),
                    ct = 0;

                if (!length) return children;

                for (var i in a){
                    // need to compile element for a[i] but not re-run repeat, also need to set $parent
                    var io = {};
                    io.$parent = o;
                    io.$index = ct;
                    io.$first = ct === 0;
                    io.$last = ct === length - 1;
                    io.$middle = !io.$first && !io.$last;
                    io.$even = ct%2;
                    io.$odd = !io.$even;

                    io[key] = isObject ? i : a[i];
                    if (val) io[val] = a[i];
                    var child = this.compile(io,true);
                    str+=child.html;
                    children.push(child);
                    ct++;
                }
                //console.log(children);

                return {
                    html: str,
                    str: "",
                    openTag: "",
                    closeTag: "",
                    item: this,
                    isRepeat: true,
                    children: children
                };
            },
            watch: function(o) {
                var splices = o.splices,
                    guid = o.$el[0]._vpGUID;

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

                    for (var j = 0; j < (numAdded - numRemoved); j++){
                        added.push(idx + j + (numRemoved ? 1 : 0));
                    }

                }
                var a = parseFunc(o.change.object),
                    length = _getLength(a),
                    isObject = typeof a === "object" && !$.isArray(a);
                //console.log(a, added) ;
                for (var i=0; i<added.length; i++){
                    var ct = added[i];
                    var io = {};
                    io.$parent = o.change.object;
                    io.$index = ct;
                    io.$first = ct === 0;
                    io.$last = ct === length - 1;
                    io.$middle = !io.$first && !io.$last;
                    io.$even = ct%2;
                    io.$odd = !io.$even;

                    io[key] = isObject ? i : a[i];
                    if (val) io[val] = a[i];
                    console.log(io);
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
                    console.log($ifEl);
                    o.$el.replaceWith($ifEl.$el);
                } else if (o.$el[0].nodeType !==8 && !parseFunc(o.change.object)){
                    var cObj = {
                        str: "",
                        comment: true,
                        openTag: this.start + " ng-if='" + this.watches.directives["if"].oValue + "' " + (this.unary ? " />" : ">"),
                        closeTag: this.end,
                        item: this,
                        children: []
                    };
                    var cO = this.compile(o.change.object);
                    console.log(o.change.object);
                    var $c = _compileHTMLEl(cO, o.change.object);
                    o.$el.replaceWith($c.$el);

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

    function _parseIncludeDirective(value){
        var template = $(value).html(),
            vO = _parseTemplate(template);

        return {
            link: function(o){
                this.children = [vO];
            },
            watch: function(o){

                console.log(this, o);
                console.log("include watch");
            }
        }

    };

    var setListener = function(o, type, parseFunc, value){
        var $el = o.$el,
            name = "dc-" + type + "-" + value,
            oldFn = $el.data(name);
        if (oldFn){
            $el.off(type, "div, span", oldFn);
            $el.data(name, null);
        }
        var callback = parseFunc(o.change.object);
        if (typeof callback !== "function") return;
        var fn = function(){
            callback.apply(o.change.object, arguments);
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
                setListener(o, type, parseFunc, value);
            },
            watch: function(o) {
                setListener(o, type, parseFunc, value);
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
                var vO = _parseTemplate(val).children;
                this.children = this.children.concat(vO);
            },
            watch: function(o) {
                var val = parseFunc(o.change.object);
                if (o.$el.html() !== val) {
                    o.$el.html(val);
                }
            },
            paths: paths
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