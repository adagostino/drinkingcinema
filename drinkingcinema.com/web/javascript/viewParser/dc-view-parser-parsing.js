(function(viewParser){
    var ngReg = new RegExp("^dc-","i"),
        semiReg = new RegExp(";$"),
        spacesReg = /^ +$/;
        startTag = /<([-A-Za-z0-9_:]+)((?:\s+[-A-Za-z0-9_]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/g,
        endTag = /<\/([-A-Za-z0-9_:]+)[^>]*>/g,
        $parse = window.ngParser;

    viewParser.prototype.parseTemplate = function(html){
        var self = this,
            el = self.getEl(),
            currEl = el,
            ct = [],
            parseCt = function(ct,el){
                var str = ct.length ? "children["+ct.join("].children[") +"]" : "";
                return str ? $parse(str)(el) : el;
            };

        HTMLParser(html,{
            start: function(tag, attrs, unary){
                var nEl = self.getEl(tag, attrs, unary);
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
                if (spacesReg.test(text) || $.trim(text)) {
                    var pt = self.parseText(text, true);
                    var nEl = self.getEl();
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

    viewParser.prototype.getEl = function (tag, attrs, unary){
        var parsedAttrs = this.parseAttributes(attrs);
        // order the directives so repeat is first, then if, then everything else
        var directives = [];
        parsedAttrs.repeat && directives.push({name: "repeat", value: parsedAttrs.repeat}) && delete parsedAttrs.repeat;
        parsedAttrs["if"] && directives.push({name: "if", value: parsedAttrs["if"]}) && delete parsedAttrs["if"];
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

    var _clean = function(str, doItRight) {
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
    };

    viewParser.prototype.parseText = function(str,clean){
        clean = typeof clean === "boolean" ? clean : false;
        var a = [],
            lastIdx = 0,
            watch = false,
            paths = [],
            self = this;


        str.replace(/{{[^}}]+}}/ig,function(match,idx){
            a.push(str.substring(lastIdx,idx));
            watch = true;
            var tMatch = match.replace(/({|})/g,"");

            var parseFunc = $parse(tMatch);
            var tPaths = self.getPaths(parseFunc.lexer.lex(tMatch));
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

    viewParser.prototype.parseAttributes = function(attrs){
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
                var pd = this.parseDirective(name, o.value);
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

                var pa = this.parseText(value);
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
                            !$el.attr && console.log($el, key);
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

    viewParser.prototype.parseDirective = function(name,value){
        var self = this;
        switch(name){
            case "attr":
                return self.parseAttrDirective(value);
                break;
            case "class":
                // push each key / value into this.attributes.class array
                return self.parseClassDirective(value);
                break;
            case "if":
                return self.parseIfDirective(value);
                break;
            case "repeat":
                return self.parseRepeatDirective(value);
                break;
            case  "style":
                return self.parseStyleDirective(value);
                break;
            case "include":
                return self.parseIncludeDirective(value);
                break;
            case "model":
                return self.parseModelDirective(value);
                break;
            default:
                return self.parseDefaultDirective(value, name);
                break;
        }
    };

})(window.viewParserClass);