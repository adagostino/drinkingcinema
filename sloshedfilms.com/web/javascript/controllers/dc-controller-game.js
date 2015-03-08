var name = "controller.game";
(function(name){

    var controller = function(){
        this.init = function(){
            this.page = $dc.utils.getJSON('pageJSON','dc-page-json');
            this.game = this.page.game;
            this.cdn = $dc.globals.cdn;
        }
    };

    $dc.add(name, controller);
})(name);
