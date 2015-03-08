var name = "controller.header";
(function(name){

    var controller = function(){
        this.init = function(){
            this.page = $dc.utils.getJSON('pageJSON', 'dc-page-json');
            this.searchText = "";
        }
    };

    $dc.add(name, controller);
})(name);