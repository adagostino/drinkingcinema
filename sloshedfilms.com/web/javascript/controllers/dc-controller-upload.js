var name = "controller.upload";
(function(name){
    var upload = new function(){
        var $scope = this;
        $scope.game = {
            'tags': "Party all the time."
        };


        this.init = function(){
            var editTemplate = $("#dc-directive-editable-template").html();
            var rte = $dc.directive.editable.init({
                $el: $("[directive-editable='tags']"),
                content: $scope.game.tags,
                template: editTemplate,
                submit: function(){


                }
            });

        };
    };
    $dc.extend(name, upload);
})(name);