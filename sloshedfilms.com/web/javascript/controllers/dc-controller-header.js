var name = "controller.header";
(function(name){

    var controller = function(){
        this.init = function(){
            this.searchText = "";
        }
    };

    $dc.add(name, controller);
})(name);