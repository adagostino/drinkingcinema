var name = "directive.gameImage";
(function(name){
    var gameImage = function() {

    };

    gameImage.prototype.init = function(){

    };

    $dc.addDirective({
        name: name,
        directive: gameImage,
        template: "#dc-directive-game-image-template",
        $scope: {
            'game': '=game'
        }
    });

})(name);