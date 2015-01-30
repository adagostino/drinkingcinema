var name = "controller.game";
(function(name){

    var controller = function(){
        this.init = function(){
            this.game = $dc.utils.getJSON('gameJSON','dc-game-json');
            var vo = $dc.utils.getJSON('vendorJSON','dc-vendor-json');
            var va = [];
            for (var i in vo){
                va[parseInt(i)] = vo[i];
            }
            this.vendors = va;
            this.cdn = $dc.globals.cdn;
        }
    };

    $dc.add(name, controller);
})(name);
