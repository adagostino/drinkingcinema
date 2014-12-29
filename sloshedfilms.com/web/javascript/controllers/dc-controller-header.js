var name = "controller.header";
(function(name){

    var controller = new function(){
        this.init = function(){
            var $searchInput = $(".dc-search-input");
            $dc.directive.searchInput.init({
                $el: $searchInput
            });
        }
    };

    $dc.extend(name, controller);
})(name);