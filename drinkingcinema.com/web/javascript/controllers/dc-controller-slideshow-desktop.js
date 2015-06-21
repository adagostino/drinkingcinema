var name = "controller.slideshow.desktop";
(function(name){

    var controller = function(){
        var $scope;

        this.init = function(){
            $scope = this;
            this._super();

        };
    };

    $dc.add(name, controller);
})(name);
