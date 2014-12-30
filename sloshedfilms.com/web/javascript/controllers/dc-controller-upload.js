var name = "controller.upload";
(function(name){
    var upload = new function(){
        var $scope = this;
        $scope.game = {
            'tags': "Party"
        };


        this.init = function(){
            var editTemplate = $("#dc-directive-editable-template").html();
            $dc.directive.editable.init({
                $el: $("[directive-editable='tags']"),
                content: $scope.game.tags,
                template: editTemplate
            });
        };
    };
    $dc.extend(name, upload);
})(name);