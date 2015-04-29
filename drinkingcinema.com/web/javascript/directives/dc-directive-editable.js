var name = "directive.editable";
(function(name){
    var keys = {
        'ctrl':     17,
        'cmd':      91,
        'b':        66,
        'i':        73,
        'u':        85
    };

    var editable = function(){};

    editable.prototype.processing = false;
    editable.prototype.editing = false;

    editable.prototype.init = function(){
        //this.$el = $dc.watchElement(this.$el, this, this.template);
        this.$ce = this.$el.find("[contenteditable]");
        // set up the oContent variable to revert
        this.oContent = this.content;
        this.isEditable = false;

        this.$watch("editing", function(n, o){
            if (n) {
                this.oContent = this.content;
            } else {
                this.errors = undefined;
            }
            this.isEditable = n && !this.processing;
        });

        this.$watch("processing", function(n,o){
            this.isEditable = !n && this.editing;
        });


        return this;
    };

    editable.prototype.onFocus = function(e) {
        this.hasFocus = true;
    };

    editable.prototype.onBlur = function(e) {
        this.hasFocus = false;
    };

    editable.prototype.onKeydown = function(e) {
        switch(e.which){
            case keys["ctrl"]:
                this.ctrl = true;
                break;
            case keys["cmd"]:
                this.cmd = true;
                break;
            case keys["b"]:
                if (this.ctrl || this.cmd) {
                    e.preventDefault();
                }
                break;
            case keys["i"]:
                if (this.ctrl || this.cmd) {
                    e.preventDefault();
                }
                break;
            case keys["u"]:
                if (this.ctrl || this.cmd) {
                    e.preventDefault();
                }
                break;
            default:
                break;
        };
    };

    editable.prototype.onKeyup = function(e){
        switch(e.which){
            case keys["ctrl"]:
                this.ctrl = false;
                break;
            case keys["cmd"]:
                this.cmd = false;
                break;
            default:
                break;
        }
    };

    editable.prototype.edit = function(e) {
        this.editing = true;
        var $ce = this.$ce;
        this.$timeout(function(){
            $ce.focus();
            $dc.utils.rangeHelper.moveCursor($ce);
        });
    };

    editable.prototype.cancel = function(e) {
        this.editing = false;
        var str = this.oContent;
        this.content = str;
    };

    editable.prototype.submit = function(e) {
        console.log('submit', this.$ce.html());
    };

    editable.prototype.onClick = function(e) {
        if (this.editing && $dc.utils.getAnchorFromTarget(e.target)) {
            //e.preventDefault();
            //e.stopImmediatePropagation();
        }
    };

    $dc.addDirective({
        name: name,
        directive: editable,
        template: "#dc-directive-editable-template",
        $scope: {
            content: "content",
            submit: "&submit"
        }
    });

})(name);

(function(){
    var rangeHelper = function() {

    };

    rangeHelper.prototype.moveCursor = function(el, atStart) {
        http://stackoverflow.com/questions/4233265/contenteditable-set-caret-at-the-end-of-the-text-cross-browser
            atStart = !!atStart;
        if (el.length) el = atStart ? el[0] : el[el.length - 1];
        if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
            var range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(atStart);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.body.createTextRange != "undefined") {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(atStart);
            textRange.select();
        }
    };
    rangeHelper.prototype.setSelection = function(range){
        range = range.value || range;
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    };

    rangeHelper.prototype.getSelectionText = function(){
        var text = "";
        if (window.getSelection) {
            text = window.getSelection().toString();
        } else if (document.selection && document.selection.type != "Control") {
            text = document.selection.createRange().text;
        }
        return text;
    };

    rangeHelper.prototype.selectText = function(el) {
        el = el[0] || el;
        var range, selection;

        if (document.body.createTextRange) {
            range = document.body.createTextRange();
            range.moveToElementText(el);
            range.select();
        } else if (window.getSelection) {
            selection = window.getSelection();
            range = document.createRange();
            range.selectNodeContents(el);

            selection.removeAllRanges();
            selection.addRange(range);
        }
    };

    rangeHelper.prototype.inAnchor = function($el){
        var $a = $el.is("a") ? $el : undefined;
        return $el.is("[contenteditable]") || $el.is("body") || $a ? $a : this.inAnchor($el.parent());
    };

    rangeHelper.prototype.inList = function($el, o){
        o = o || {};
        if (!o.ul) o.ul = $el.is("ul");
        if (!o.ol) o.ol = $el.is("ol");

        return $el.is("[contenteditable]") || $el.is("body") || (o.ul && o.ol) ? o : this.inList($el.parent(),o);
    };
    // need to supply a style map -- a map of styles to look for -- to get the css from range.
    // it's b/c you can have things like <b>p<i>art</i>y</b>
    rangeHelper.prototype.getSelectionObject = function(styleMap, $el){
        var range = this.getRangeObject($el);
        var els = range.type === "range" ? range.value.nodes : range.value;
        els = $.isArray(els) ? els : [els];
        var o = {
            'styles': {},
            'inList': undefined,
            'inAnchor': undefined,
            'boundingClientRect': undefined
        };
        // used to be els.length, but acutally it's only the first node that matters
        var $el;
        for (var i=0; i<1; i++){
            $el = $(els[i]);
            if (range.type === "range" && $el[0].nodeType === 3){
                $el = $el.parent();
            }
            for (var key in styleMap){
                var style = $el.css(key);
                if (style){
                    o.styles[key] = style;
                }
            }
            o.inList = this.inList($el, o.inList);
        }
        o.inAnchor = this.inAnchor($el);
        o.boundingClientRect = (o.inAnchor || $el)[0].getBoundingClientRect();
        o.range = range;
        return o;
    };

    var _isChildOfEditor = function($el){
        var isChild = $el.is("[contenteditable]");
        return $el.is("body") || isChild ? isChild : _isChildOfEditor($el.parent());
    };

    rangeHelper.prototype.getRangeObject =  function($el){
        var range = this.getRange();
        // range can be 3 things: collapsed, a range, or an actual element
        // type: element or range
        // collapsed: true or false or null
        // value: rangeObject or element
        var rObj = {type: null, collapsed: null, value: null};
        if (range && !range.collapsed){
            rObj.type = "range";
            rObj.collapsed = false;
            rObj.value = range;
        }else if (range && range.collapsed && _isChildOfEditor($(range.commonAncestorContainer))){
            // need to test here to see if we have a false positive and we're actually selecting an element
            // sometimes window.selection will give us a value of "caret" when it's not really a caret -- too bad.
            rObj.type = "range";
            rObj.collapsed = true;
            rObj.value = range;
        }else{
            rObj.type = "element";
            rObj.value = $el;
        }
        return rObj;
    }

    rangeHelper.prototype.getRange = function(win){
        // https://gist.github.com/Munawwar/1115251
        // Thanks!
        win = win ? win : window;
        var r = null;
        if (win.getSelection){
            var s = win.getSelection();
            if (s.type === "None") return r;
            r = win.getSelection().getRangeAt(0);
        }else if (win.document.selection){
            var range=win.document.selection.createRange();
            r = fixIERangeObject(range,win);
        }
        if (r){
            r.nodes = getRangeSelectedNodes(r);
            if (!r.commonAncestorContainer){
                // probably not nec true -- could be other node types, but for our purpose, it is
                r.commonAncestorContainer = r.nodes[0].nodeType === 3 ? r.nodes[0] : r.nodes[0].parentElement;
            }
        }
        return r;

        //http://stackoverflow.com/questions/7781963/js-get-array-of-all-selected-nodes-in-contenteditable-div
        function nextNode(node) {
            if (node.hasChildNodes()) {
                return node.firstChild;
            } else {
                while (node && !node.nextSibling) {
                    node = node.parentNode;
                }
                if (!node) {
                    return null;
                }
                return node.nextSibling;
            }
        }

        function getRangeSelectedNodes(range) {
            var node = range.startContainer;
            var endNode = range.endContainer;

            // Special case for a range that is contained within a single node
            if (node == endNode) {
                return [node];
            }

            // Iterate nodes until we hit the end container
            var rangeNodes = [];
            while (node && node != endNode) {
                rangeNodes.push( node = nextNode(node) );
            }
            // Add partially selected nodes at the start of the range
            node = range.startContainer;
            while (node && node != range.commonAncestorContainer) {
                rangeNodes.unshift(node);
                node = node.parentNode;
            }
            return rangeNodes;
        }

        function fixIERangeObject(range,win) { //Only for IE8 and below.
            win=win || window;
            if(!range) return null;
            if(!range.startContainer && win.document.selection) { //IE8 and below
                var _findTextNode=function(parentElement,text) {
                    //Iterate through all the child text nodes and check for matches
                    //As we go through each text node keep removing the text value (substring) from the beginning of the text variable.
                    var container=null,offset=-1;
                    for(var node=parentElement.firstChild; node; node=node.nextSibling) {
                        if(node.nodeType==3) {//Text node
                            var find=node.nodeValue;
                            var pos=text.indexOf(find);
                            if(pos==0 && text!=find) { //text==find is a special case
                                text=text.substring(find.length);
                            } else {
                                container=node;
                                offset=text.length-1; //Offset to the last character of text. text[text.length-1] will give the last character.
                                break;
                            }
                        }
                    }
                    //Debug Message
                    //alert(container.nodeValue);
                    return {node: container,offset: offset}; //nodeInfo
                }

                var rangeCopy1=range.duplicate(), rangeCopy2=range.duplicate(); //Create a copy
                var rangeObj1=range.duplicate(), rangeObj2=range.duplicate(); //More copies :P

                rangeCopy1.collapse(true); //Go to beginning of the selection
                rangeCopy1.moveEnd('character',1); //Select only the first character
                rangeCopy2.collapse(false); //Go to the end of the selection
                rangeCopy2.moveStart('character',-1); //Select only the last character

                //Debug Message
                // alert(rangeCopy1.text); //Should be the first character of the selection
                var parentElement1=rangeCopy1.parentElement(), parentElement2=rangeCopy2.parentElement();

                //If user clicks the input button without selecting text, then moveToElementText throws an error.
                if(parentElement1 instanceof HTMLInputElement || parentElement2 instanceof HTMLInputElement) {
                    return null;
                }
                rangeObj1.moveToElementText(parentElement1); //Select all text of parentElement
                rangeObj1.setEndPoint('EndToEnd',rangeCopy1); //Set end point to the first character of the 'real' selection
                rangeObj2.moveToElementText(parentElement2);
                rangeObj2.setEndPoint('EndToEnd',rangeCopy2); //Set end point to the last character of the 'real' selection

                var text1=rangeObj1.text; //Now we get all text from parentElement's first character upto the real selection's first character
                var text2=rangeObj2.text; //Here we get all text from parentElement's first character upto the real selection's last character

                var nodeInfo1=_findTextNode(parentElement1,text1);
                var nodeInfo2=_findTextNode(parentElement2,text2);

                //Finally we are here
                range.startContainer=nodeInfo1.node;
                range.startOffset=nodeInfo1.offset;
                range.endContainer=nodeInfo2.node;
                range.endOffset=nodeInfo2.offset+1; //End offset comes 1 position after the last character of selection.
                range.collapsed = range.startContainer === range.endContainer && range.startOffset === range.endOffset ? true : false;
            }
            return range;
        }
    };


    $dc.utils.rangeHelper = new rangeHelper();
})(name);
