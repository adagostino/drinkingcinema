(function(global){

    var $dc = new function(){
        this.extend = function(name, child) {
            if (!name || !child) return;
            var names = name.split("."),
                parent = this;

            for (var i=0; i<names.length; i++){
                var o = parent[names[i]];
                if (!o) {
                    o = this.subClass(parent, child);
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
        var platformController = controller.desktop || controller.mobile;
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
