var name = "controller.game.desktop.admin";
(function(name){
    var controller = new function(){
        this.init = function(){
            this._super();
            console.log("init the game controller desktop admin");
        }
    };

    $dc.extend(name, controller);
})(name);
