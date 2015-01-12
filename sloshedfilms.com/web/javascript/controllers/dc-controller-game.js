var name = "controller.game";
(function(name){

    var controller = new function(){
        this.init = function(){
            console.log("init the game controller");
            this.game = $dc.model.game.getGameJSON();

        }
    };

    $dc.extend(name, controller);
})(name);
