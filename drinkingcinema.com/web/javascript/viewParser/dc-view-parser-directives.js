(function(viewParser){
    var _events = {
        'input': 'input',
        'change': 'change',
        'keyup': 'keyup',
        'keydown': 'keydown',
        'click': 'click',
        'mouseup': 'mouseup',
        'mousedown': 'mousedown',
        'mouseenter': 'mouseenter',
        'mouseleave': 'mouseleave',
        'focus': 'focus',
        'blur': 'blur',
        'load': 'load',
        'paste': 'paste',
        'dragstart': 'dragstart',
        'drag': 'drag',
        'dragenter': 'dragenter',
        'dragleave': 'dragleave',
        'dragover': 'dragover',
        'drop': 'drop',
        'dragend': 'dragend'
    };

    var $parse = window.ngParser;

    var _getLength = function(o){
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

    viewParser.prototype.parseRepeatDirective = function(value){
        var list = value.match(/(?:\s+in\s+)([-A-Za-z0-9_\.]+)\s*/i)[1],
            keyMatch = value.match(/(?:\s*)\(*([-A-Za-z0-9_]+)(?:\s*\,*\s*)([-A-Za-z0-9_]+)*\)*(?:\s+in)/i),
            key = keyMatch[1],
            val = keyMatch[2],
            parseFunc = $parse(list);
        var paths = this.getPaths(parseFunc.lexer.lex(list));

        var dcRepeatItems = [],
            compiled = false;

        var self = this,
            addItems = function(addedIndicies) {

            }

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
                var nodeType = (o.$el[0] || o.$el).nodeType;
                var commentCt = 0;
                (nodeType === 11 ? $(o.$el.childNodes) : o.$el.children()).each(function(idx){
                    // the first item in the repeat should always be a comment, so skip it
                    if (this.nodeType === 8 && idx === 0) {
                        commentCt++;
                    } else {
                        dcRepeatItems[idx - commentCt].guid = this._vpGUID;
                    }
                });
            },
            watch: function(o) {
                var splices = o.splices,
                    guid = o.guid;
                // get information about the changed object
                var a = parseFunc(o.change.object),
                    length = _getLength(a),
                    isObject = typeof a === "object" && !$.isArray(a);

                var parent = self.getScopeObj(guid);
                // if !o.splices, then it's a whole new array and needs to be completely
                // rebuilt j -- so fake out that splices array, brah!

                if (!splices || !$.isArray(splices)) {
                    splices = [
                        {
                            addedCount: length,
                            index: 0,
                            removed: dcRepeatItems
                        }
                    ];
                };

                // check it: have to put the added, removed, changed things inside this splices loop
                for (var i = 0; i < splices.length; i++) {
                    var changed = [], removed = [], added = [];
                    var idx = splices[i].index,
                        numAdded = splices[i].addedCount,
                        numRemoved = splices[i].removed.length;
                    // start with removed
                    for (var j = 0; j < numRemoved; j++) {
                        if (j < numAdded) {
                            changed.push(idx + j);
                        } else {
                            removed.push(idx + j);
                        }
                    }
                    var lastChangedIdx = changed[changed.length - 1] || idx;
                    for (var j = 0; j < (numAdded - numRemoved); j++) {
                        //console.log(lastChangedIdx, j, numRemoved);
                        added.push(lastChangedIdx + j + (numRemoved ? 1 : 0));
                    }

                    for (var j = 0; j < added.length; j++) {
                        var ct = added[j];
                        var io = {};
                        io.parentScope = o.change.object;
                        io[key] = isObject ? ct : a[ct]; // item of "item in items" -- so the actual child object
                        if (val) io[val] = a[j];
                        var childParsedHTML = this.compile(io, true);

                        var addedObj = self.compileHTMLEl(childParsedHTML, io, parent.repeatItem);

                        self.setScopeObj(addedObj);
                        var prevGuid;
                        if (ct <= 0) {
                            ct = 0;
                        } else if (ct > dcRepeatItems) {
                            ct = dcRepeatItems.length;
                        }
                        parent.children[addedObj.guid] = {
                            type: (addedObj.$el[0] || addedObj.$el).nodeType
                        };
                        // now add it into the dom
                        var prevGuid = ct - 1 > -1 ? dcRepeatItems[ct - 1].guid : parent.commentGuid;

                        self.getScopeObj(prevGuid).$el.after(addedObj.$el);
                        dcRepeatItems.splice(ct, 0, {
                            io: io,
                            guid: addedObj.guid
                        });

                    }

                    for (var j = 0; j < changed.length; j++) {
                        var ct = changed[i],
                            io = {};
                        io.parentScope = o.change.object;
                        dcRepeatItems[ct].io[key] = isObject ? ct : a[ct];
                        if (val) dcRepeatItems[ct].io[val] = a[j];
                    }

                    for (var j = 0; j < removed.length; j++) {
                        var ct = removed[j] - j,
                            guid = dcRepeatItems[ct] ? dcRepeatItems[ct].guid : undefined;
                        self.removeElement(guid);
                        dcRepeatItems.splice(ct, 1);
                    }


                };

                // at the end, run through all of the items in the array and change them accordingly -- may be expensive
                // depending on what you're doing -- adding classes based on even or odd could be rotten
                for (var i=0; i<dcRepeatItems.length; i++){
                    var io = dcRepeatItems[i].io;
                    io.repeatIndex = i;
                    io.repeatFirst = i === 0;
                    io.repeatLast = i === length - 1;
                    io.repeatMiddle = !io.repeatFirst && !io.repeatLast;
                    io.repeatEven = !!(i%2);
                    io.repeatOdd = !io.repeatEven;
                };
            },
            paths: paths
        }
    };

    viewParser.prototype.parseIfDirective = function(value) {
        var parseFunc = $parse(value),
            paths = this.getPaths(parseFunc.lexer.lex(value)),
            self = this;
        return {
            link: function(o){
                return !!parseFunc(o);
            },
            watch: function(o){
                //console.log("this causes a memory leak b/c i don't unobserve", o.$el[0].nodeType, o.$el[0]);
                if (o.$el[0].nodeType === 8 && !!parseFunc(o.change.object)){
                    // add item
                    var cO = this.compile(o.change.object);
                    var $ifEl = self.compileHTMLEl(cO, o.change.object);
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
                    var $c = self.compileHTMLEl(cO, o.change.object);
                    o.$el.replaceWith($c.$el);
                    self.removeElement(o.guid);

                }
            },
            paths: paths
        }
    };

    viewParser.prototype.parseAttrDirective = function(value) {
        var parseFunc = $parse(value);
        var paths = this.getPaths(parseFunc.lexer.lex(value));
        return {
            link: function(o){
                //console.log(this);
                var attrs = parseFunc(o);
                for (var key in attrs){
                    if (attrs[key]){
                        this.attributes[key] = attrs[key];
                    }
                    else {
                        delete this.attributes[key];
                    }
                }
            },
            watch: function(o){
                var attrs = parseFunc(o.change.object);
                for (var key in attrs){
                    if (attrs[key]) {
                        this.attributes[key] = attrs[key];
                        o.$el.attr(key, attrs[key]);
                    }else{
                        o.$el.removeAttr(key);
                    }
                }
            },
            paths: paths
        }
    };

    viewParser.prototype.parseClassDirective = function(value) {
        //todo: make more robust and check if class already exists
        var parseFunc = $parse(value);
        var paths = this.getPaths(parseFunc.lexer.lex(value));
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

    viewParser.prototype.parseStyleDirective = function(value){
        //todo: make more robust and check if style already exists
        var parseFunc = $parse(value);
        var paths = this.getPaths(parseFunc.lexer.lex(value));

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
                    // note: the == is so that it's a string or a number -- just checking for 0 falsey
                    o.$el.css(key, styles[key] == 0 ? styles[key] : (styles[key]|| ""));
                }
            },
            paths: paths
        }
    };

    viewParser.prototype.parseIncludeDirective = function(value){
        var parseFunc,
            self = this;
        try {
            parseFunc = $parse(value);
        } catch (e) {

        }

        return {
            link: function(o){
                var templateId = parseFunc ? parseFunc(o) : value,
                    template = $(templateId).html(),
                    vO = self.parseTemplate(template);
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
    };

    var _paramReg = /(?:\()([^\(\)]*)(?:\))/;
    viewParser.prototype.setListener = function(o, type, parseFunc, value, cb, params) {
        var $els = (!o.$el.length && o.$el.nodeType === 11) ? $(o.$el.children) : o.$el,
            name = "dc-" + type + "-" + value,
            self = this;

        $els.each(function(){
            var $el = $(this);
            var oldFn = $el.data(name);
            if (oldFn){
                $el.off(type, oldFn);
                $el.data(name, null);
            }

            var callback = cb || parseFunc(o.change.object);
            if (typeof callback !== "function") return;

            var fn = function(e){
                var scope = _getScopeOfFunction(o.change.object, value);
                if (params && params.length) {
                    var targetScope = self.getScopeFromElement(e.target);
                    var a = [];
                    for (var i=0; i<params.length; i++) {
                        a.push(params[i] === "e" ? e : $parse(params[i])(targetScope));
                    }
                    arguments = a;
                }
                callback.apply(scope, arguments);
                Platform.performMicrotaskCheckpoint();
            };
            $el.data(name, fn);
            $el.on(type, fn);
        });
    };

    viewParser.prototype.parseListenDirective = function(value, type){
        var params = [];
        value = value.replace(_paramReg, function(match, $1){
            if ($1) params = $1.split(",");
            return "";
        });
        var parseFunc = $parse(value),
            paths = this.getPaths(parseFunc.lexer.lex(value)),
            self = this;
        return {
            link: function(o) {

            },
            compile: function(o) {
                self.setListener(o, type, parseFunc, value, null, params);
            },
            watch: function(o) {
                self.setListener(o, type, parseFunc, value, null, params);
            },
            paths: paths
        }
    };

    viewParser.prototype.parseModelDirective = function(value){
        var parseFunc = $parse(value),
            paths = this.getPaths(parseFunc.lexer.lex(value)),
            self = this;
        return {
            link: function(o) {
                var val = parseFunc(o);
                if (this.tag === "input" || this.tag === "textarea"){
                    this.attributes['value'] = [val || ""];
                } else {
                    var vO = self.parseTemplate(val);
                    var a = vO.start ? [vO] : vO.children;
                    this.children = this.children.concat(a);
                }

            },
            compile: function(o) {
                // set up a listener
                var fn = this.tag === "input" || this.tag === "textarea" ? "val" : "html";
                self.setListener(o, "input", parseFunc, value, function(){
                    Path.get(value).setValueFrom(this, o.$el[fn]());
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

    viewParser.prototype.parseCustomDirective = function(value, name) {
        // value is the scope, if it exists
        var parseFunc = $parse(value),
            paths = this.getPaths(parseFunc.lexer.lex(value)),
            dir = this.customDirectives[name],
            self = this;
        return {
            link: function(o) {
                // don't do anything -- only do something on compile
            },
            compile: function(o) {
                var $scope;
                if (dir.directive.prototype.isolateScope){
                    $scope = new dir.directive();
                    $scope.parentScope = o.change.object;
                } else {
                    // extend the parent scope with the new directive
                    var d = new dir.directive();
                    $.extend(true, o.change.object, d);
                    $scope = o.change.object;
                }
                $scope.$el = o.$el;
                $scope.$call($scope.parseIsolateScope);

                if (dir.directive.prototype.template){
                    var vo;
                    // TODO: figure out how to re-use the parsed template
                    //if (!dir.vo){
                        var reg = /^[^a-zA-Z0-9]/,
                            t = dir.directive.prototype.template,
                            template = typeof t === "function" ? t($scope) : t.match(reg) ? $(t).html() : t;

                        var vo = self.parseTemplate(template);

                    //}
                    var child = self.compileHTMLEl(vo.compile($scope),$scope);
                    var $childEl = self.getNode(child);

                    try {
                        o.$el.append($childEl);
                    } catch(e) {
                        o.$el.appendChild($childEl[0] || $childEl);
                    };


                    var nodeType = ($childEl[0] || $childEl).nodeType;
                    o.children[child.guid] = {
                        type: nodeType
                    };
                };
                $scope.$call($scope.init);
            },
            watch: function(o) {
                console.log("in watch?");
            },
            paths: paths,
            custom: true
        }
    };

    viewParser.prototype.parseDefaultDirective = function(value, name){
        if (_events[name]) {
            return this.parseListenDirective(value, _events[name]);
        } else if (this.customDirectives[name]) {
            return this.parseCustomDirective(value, name);
        } else {
            name !== "controller" && console.warn("could not parse '",name, ".' Have you added the directive to your code yet?");
        }
        return {};
    };


})(window.viewParserClass);