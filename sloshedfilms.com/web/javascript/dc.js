(function(global){

    var $dc = new function(){
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

    };

    global.drinkingCinema = global.$dc = $dc;
})(window);
// initialize
(function(){
    // assume controller.[desktop or mobile].[admin?]
    var _getInit = function(controller){
        var platformController = (controller.desktop || controller.mobile) || controller;
        var init = platformController.init;
        return platformController.admin && platformController.admin.init ? platformController.admin.init : init;
    }

    $(document).ready(function(){
        for (var name in $dc.controller){
            var o = $dc.controller[name];
            if (o.$dcType === "controller"){
                var init = _getInit($dc.controller[name]);
                typeof init === "function" && init();
            }

        }
    });
})();
