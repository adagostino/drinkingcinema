var name = "controller.game.desktop";
(function(name){
    var controller = function(){
        this.init = function(){
            this._super();
            $dc.initImageToolTip();
        }
    };

    $dc.add(name, controller);
})(name);
