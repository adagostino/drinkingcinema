var name = "controller.slideshow.desktop.admin";
(function(name){

    var controller = function(){
        var $scope;

        this.init = function(){
            $scope = this;
            this._super();
            window.$scope = this;
        };

        this.submit = function(key) {
            if ($scope.slideshow[key] !== this.content){
                this.processing = true;
                var slideshow = {
                    name: $scope.slideshow.name
                };
                slideshow[key] = this.content;
                $dc.model.slideshow.putUpdate({
                    $scope: this,
                    slideshow: slideshow,
                    success: function(data){
                        this.processing = false;
                        this.editing = false;
                        this.content = data[key];
                        $scope.slideshow[key] = this.content;
                    },
                    error: function(err, xhr){
                        //alert(JSON.stringify(err));
                        this.errors = err.errors;
                        this.processing = false;
                    }
                });
            }else {
                this.editing = false;
            }
        };

        this.titleOpen = function() {
            $scope.titleZIndex = 1;
            if (!$scope.descriptionZIndex) $scope.descriptionZIndex = 0;
        };

        this.titleClose = function() {
            $scope.titleZIndex = null;
            if ($scope.descriptionZIndex === 0) $scope.descriptionZIndex = null;
        };

        this.submitTitle = function(){
            this.$call($scope.submit,"title");
        };

        this.submitDescription = function(){
            this.$call($scope.submit,"description");
        };

    };

    $dc.add(name, controller);
})(name);
