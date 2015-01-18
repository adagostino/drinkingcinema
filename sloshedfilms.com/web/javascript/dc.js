(function(global){

    var $dc = new function(){
        this.globals = {
            "cdn": "http://cdn.drinkingcinema.com/"
        };

        this.add = function(name, child) {
            if (!name || !child) return;
            var names = name.split("."),
                parent = this;
            for (var i=0; i<names.length; i++){
                if (!parent[names[i]]) {
                    // don't subclass $dc
                    parent[names[i]] = i === names.length - 1 ? child : {};
                }
                parent = parent[names[i]];
            }
            return this;
        };

        this.extend = function(name, child, inherit) {
            if (!name || !child) return;
            inherit = typeof inherit === "boolean" ? inherit : true;
            var names = name.split("."),
                parent = this;
            for (var i=0; i<names.length; i++){
                var o = parent[names[i]];
                if (!o) {
                    // don't subclass $dc
                    o = inherit ? this.subClass(parent, child) : child;
                    parent[names[i]] = o;
                }
                parent = o;
            }
            return this;
        };

        this.subClass = function(parent, child){
            var c = Object.subClass.call(parent, child);
            return new c();
        };

        this.formatTemplates = function(){
            $("[type='dc-template']").each(function(){
               var $this = $(this),
                   template = $(this).html();
                $this.html(template.replace(/\{\%.*\%\}/g, ""));

            });
        }

    };

    global.drinkingCinema = global.$dc = $dc;
})(window);
// initialize
(function(){
    // assume controller.[desktop or mobile].[admin?]
    var _getInit = function(controller){
        var platformController = (controller.desktop || controller.mobile) || controller;
        var init = platformController.init;
        var o = {
            init: init,
            controller: platformController
        };
        if (platformController.admin && platformController.admin.init){
            o.init = platformController.admin.init;
            o.controller = platformController.admin;
        }
        return o;
    }

    $(document).ready(function(){
        $dc.formatTemplates();
        $("[dc-controller]").each(function(){
            //return;
            var $this = $(this);
            var name = $this.attr("dc-controller");
            var controller = $dc.controller[name];
            var o = _getInit(controller);
            var template = $("#dc-controller-" + name +"-template").html();
            //console.log(controller);
            o.init.call(o.controller);
            var $c = $dc.watchElement($this, o.controller, template);
        });
    });
})();
