var name = "controller.upload";
(function(name){
    var upload = new function(){
        var $scope = this;
        $scope.game = {
            'tags': "<a href='http://drinkingcinema.com/game/Top+Gun' target='_blank'>Party</a>"
        };


        this.init = function(){
            var editTemplate = $("#dc-directive-editable-template").html();
            var rte = $dc.directive.editable.rte.init({
                $el: $("[directive-editable='tags']"),
                content: $scope.game.tags,
                template: editTemplate
            });

        };
    };
    $dc.extend(name, upload);
})(name);