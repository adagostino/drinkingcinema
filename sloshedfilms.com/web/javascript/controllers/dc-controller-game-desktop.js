var name = "controller.game.desktop";
(function(name){

    var controller = new function(){
        this.blah = function(){
            this._super();
            console.log("here is blah in the game desktop controller");
        }

        this.init = function(){
            this._super("from duh desktop");
            console.log("init the game controller desktop");
        }
    };

    $dc.extend(name, controller);
})(name);
