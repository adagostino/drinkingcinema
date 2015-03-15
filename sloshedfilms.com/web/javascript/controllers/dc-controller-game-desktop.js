var name = "controller.game.desktop";
(function(name){
    var controller = function(){

        this.initImageToolTip = function(){
            // easy way for tablets to not include the imageToolTip file
            try{
                new $dc.directive.tooltip.image().init();
            } catch(e){

            }
        };

        this.init = function(){
            this._super();
            this.initImageToolTip();
        }
    };

    $dc.add(name, controller);
})(name);
