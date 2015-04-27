var name = "controller.game";
(function(name){

    var controller = function(){
        this.init = function(){
            this.page = $dc.utils.getJSON('pageJSON','dc-page-json');
            this.game = this.page.game;
            this.cdn = this.page.cdn;
            $dc.initLightbox();
        }
    };

    $dc.add(name, controller);
})(name);
