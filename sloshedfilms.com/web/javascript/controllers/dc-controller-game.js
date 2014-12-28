var name = "controller.game";
(function(name){

    var controller = new function(){
        this.init = function(){
            console.log("init the game controller");
        }
    };

    $dc.extend(name, controller);
})(name);
