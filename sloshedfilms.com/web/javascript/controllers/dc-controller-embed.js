var name = "controller.embed";
(function(name){

    var controller = function(){
        this.init = function(){
            this.page = $dc.utils.getJSON('pageJSON','dc-page-json');
            this.game = this.page.game;
            this.cdn = $dc.utils.getCDN();
            $dc.initLightbox();
        }
    };

    $dc.add(name, controller);
})(name);
