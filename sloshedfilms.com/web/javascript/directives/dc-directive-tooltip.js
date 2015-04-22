var name = "directive.tooltip";
(function(name){
    var tooltip = function(){};

    tooltip.prototype.init = function(){
        var self = this;
        this.contentTemplate = this.$el.attr("tooltip-template") || "#dc-tooltip-text-template";
        this.$el.on('mouseenter',function(e){
            self.$call(self.mouseenter,e);
        }).on('mouseleave', function(e){
            self.$call(self.mouseleave,e);
        });
    }

    tooltip.prototype.positionToolTip = function($inputElement) {
        this.setContent();
        var $el = $inputElement || this.$el,
            marginTop =  8*Math.sqrt(2)/2,
            marginLeft =  10,
            above = false,
            tailLeft = "",
            rects = $el[0].getClientRects(),
            rect = rects[0];
        // figure out which rect to use
        for (var i=0; i<rects.length; i++) {
            if (this.mouseCoords.y >= rects[i].top && this.mouseCoords.y < rects[i].bottom &&
                this.mouseCoords.x >= rects[i].left && this.mouseCoords.x < rects[i].right ) {
                rect = rects[i];
                break;
            }
        }

        // set all the initial params from the rect
        var left = rect.left + rect.width/ 2,
            top = rect.bottom + marginTop,
            cttrect = this.$ctt[0].getBoundingClientRect(),
            height = cttrect.height || (cttrect.bottom - cttrect.top),
            width = cttrect.width || (cttrect.right - cttrect.left);

        // check if it'll go off the screen
        if (top + height > window.innerHeight) {
            top = rect.top - height - marginTop;
            above = true;
        }

        // check the left side
        if (left - width/2 < 0) {
            var offset = (left - width/2 - marginLeft); // 10px padding
            left -= offset;
            tailLeft = width/2 + offset;
            if (tailLeft < 8*Math.sqrt(2)) tailLeft = 8*Math.sqrt(2);
        }
        // now check the right side
        if (left + width/2 > window.innerWidth) {
            var offset = left + width/2 + marginLeft - window.innerWidth;
            left -= offset;
            tailLeft = width/2 + offset;
            if (tailLeft > width - 8*Math.sqrt(2)) tailLeft = width - 8*Math.sqrt(2);
        }


        this.ttScope.above = above;
        this.ttScope.left = left;
        this.ttScope.top = top;
        this.ttScope.marginLeft = -width/2;
        this.ttScope.tailLeft = tailLeft;

    };

    tooltip.prototype.setToolTip = function(id) {
        id = id || "dc-tooltip";
        var cloneId = id + "-clone";
        var $tt = $("#"+id),
            $ctt = $("#"+cloneId);
        if (!$tt.length) {
            var vp = $dc.viewParser.parse($("#dc-directive-tooltip-template").html()),
                o = {
                    showing: false,
                    top: "-100%",
                    left: "-100%",
                    right: 'auto',
                    bottom: 'auto',
                    marginLeft: 0,
                    template: this.contentTemplate
                },
                co = $.extend(true,{},o);
            co.clone = true;
            $tt  = vp.getElement(o).attr("id",id).appendTo("body");
            $ctt = vp.getElement(co).attr("id",cloneId).appendTo("body");
        }
        this.$tt = $tt;
        this.$ctt = $ctt;
        this.ttScope = $dc.getScope($tt[0]);
        this.cttScope = $dc.getScope($ctt[0]);
    };

    tooltip.prototype.setContent = function(clone, content){
        this[clone ? "cttScope" : "ttScope"].content = content || this.$el.attr("tooltip-content");
    };

    tooltip.prototype.show = function(){
        this.ttScope.showing = true;
    };

    tooltip.prototype.hide = function(){
        this.ttScope.showing = false;
    };

    //Events:
    tooltip.prototype.mouseenter = function(e){
        !this.ttScope && this.setToolTip();
        this.mouseCoords = {
            x: e.clientX,
            y: e.clientY
        };
        this.setContent(true);
        // if there's a current timeout, cancel it
        if (this.ttScope.to) {
            this.ttScope.to();
            delete this.ttScope.to;
        }
        // give it a little time to set the contents and calculate
        this.ttScope.to = this.$timeout(function(){
            delete this.ttScope.to;
            this.positionToolTip(this.delegate);
            this.show();
        });
    };

    tooltip.prototype.mouseleave = function(e){
        this.hide();
    };

    $dc.addDirective({
        name: name,
        directive: tooltip,
        $scope: {}
    });

})(name)