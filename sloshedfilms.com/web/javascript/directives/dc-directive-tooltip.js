var name = "directive.tooltip";
(function(name){
    var defaults = {
        'mouseenter': function(){
            !this.ttScope && this.setToolTip();
            this.setContent(true);
            // if there's a current timeout, cancel it
            if (this.ttScope.to) {
                this.ttScope.to();
                delete this.ttScope.to;
            }
            // give it a little time to set the contents and calculate
            this.ttScope.to = this.$timeout(function(){
                delete this.ttScope.to;
                this.positionToolTip();
                this.show();
            });
        },
        'mouseleave': function(){
            this.hide();
        },
        'setContent': function(clone, content){
            this[clone ? "cttScope" : "ttScope"].content = content || this.$el.attr("tooltip-content");
        }
    };


    var tooltip = function(opts){
        var $scope;
        this.show = function(){
            this.ttScope.show = true;
        };

        this.hide = function(){
            this.ttScope.show = false;
        };

        this.positionToolTip = function($el) {
            var rect = ($el || this.$el)[0].getBoundingClientRect(),
                left = rect.left + rect.width/ 2,
                top = rect.bottom,
                cttrect = this.$ctt[0].getBoundingClientRect();
            this.ttScope.left = left;
            this.ttScope.top = top;
            this.ttScope.marginLeft = -cttrect.width/2;
            this.setContent();
        };

        this.setToolTip = function(id) {
            id = id || "dc-tooltip";
            var cloneId = id + "-clone";
            var $tt = $("#"+id),
                $ctt = $("#"+cloneId);
            if (!$tt.length) {
                var vp = $dc.viewParser.parse($("#dc-directive-tooltip-template").html()),
                    o = {
                        show: false,
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

        this.init = function(){
            $scope = this;
            this.contentTemplate = this.$el.attr("tooltip-template") || "#dc-tooltip-text-template";
            this.$el.on('mouseenter',function(e){
                $scope.call($scope.mouseenter,e);
            }).on('mouseleave', function(e){
                $scope.call($scope.mouseleave,e);
            });
        }

    };
    $dc.directive.add(name, {
        "directive": tooltip,
        "defaults": defaults
    });

})(name)