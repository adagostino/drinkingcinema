var name = "controller.slideshow";
(function(name){

    var controller = function(){
        var $scope;

        this.init = function(){
            $scope = this;
            this.page = $dc.utils.getJSON('pageJSON', 'dc-page-json');
            this.slideshow = this.page.slideshow;
        };
    };

    $dc.add(name, controller);
})(name);
