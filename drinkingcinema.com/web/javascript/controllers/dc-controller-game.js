var name = "controller.game";
(function(name){

    var controller = function(){
        this.init = function(){
            this.page = $dc.utils.getJSON('pageJSON','dc-page-json');
            this.game = this.page.game;
            this.cdn = this.page.cdn;
            $dc.initLightbox();
        }

        this.onVendorClick = function(e, vendorName){
            $dc.ax.event($dc.ax.category.VENDOR, vendorName, this.page.title);
        };

        this.onSuggestionClick = function(e, suggestionName) {
            $dc.ax.event($dc.ax.category.SUGGESTION, suggestionName, this.page.title);
        };
    };

    $dc.add(name, controller);
})(name);
