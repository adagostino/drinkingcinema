var name = "controller.game";
(function(name){

    var controller = new function(){
        this.init = function(){
            this.game = $dc.model.getJSON('gameJSON','dc-game-json');
            var vo = $dc.model.getJSON('vendorJSON','dc-vendor-json');
            var va = [];
            for (var i in vo){
                va[parseInt(i)] = vo[i];
            }
            this.vendors = va;
            this.cdn = $dc.globals.cdn;
        }
    };

    $dc.extend(name, controller);
})(name);
