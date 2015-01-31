var name = "controller.game.desktop";
(function(name){
    var controller = function(){

        this.init = function(){
            this._super();
            new $dc.directive.tooltip.image().init();
        }
    };

    $dc.add(name, controller);
})(name);
