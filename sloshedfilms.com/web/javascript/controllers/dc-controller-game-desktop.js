var name = "controller.game.desktop";
(function(name){
    var controller = function(){
        this.init = function(){
            this._super();
            $dc.initImageToolTip();
            window.scope = this;
        }
    };

    $dc.add(name, controller);
})(name);
