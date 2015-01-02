var name = "controller.upload";
(function(name){
    var upload = new function(){
        var $scope = this;
        $scope.game = {
            'tags': "Party all the time."
        };


        this.init = function(){
            var editTemplate = $("#dc-directive-editable-template").html();
            var rte = $dc.directive.editable.rte.init({
                $el: $("[directive-editable='tags']"),
                content: $scope.game.tags,
                template: editTemplate,
                submit: function(){
                    this.processing = true;
                    this.$timeout(function(){
                        this.editing = false;
                        this.processing = false;
                        $scope.game.tags = this.content;
                        console.log($scope.game);
                    },1000);

                }
            });

        };
    };
    $dc.extend(name, upload);
})(name);