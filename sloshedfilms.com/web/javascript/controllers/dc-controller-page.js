var name = "controller.page";
(function(name){

    var controller = function(){
        this.init = function(){
            this.page = $dc.utils.getJSON('pageJSON','dc-page-json');
            $dc.initLightbox();
        }
    };

    $dc.add(name, controller);
})(name);
