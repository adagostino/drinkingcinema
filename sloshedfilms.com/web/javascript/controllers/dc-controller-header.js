var name = "controller.header";
(function(name){

    var controller = new function(){
        this.init = function(){
            $dc.directive.searchInput.init({
                $el: $(".dc-search-input")
            });
        }
    };

    $dc.extend(name, controller);
})(name);