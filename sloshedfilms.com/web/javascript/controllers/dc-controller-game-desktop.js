var name = "controller.game.desktop";
(function(name){
    var controller = new function(){

        this.init = function(){
            this._super();
            //console.log($dc.directive.tooltip.image);
            $dc.directive.tooltip.image.init();

        }
    };

    $dc.extend(name, controller);
})(name);
