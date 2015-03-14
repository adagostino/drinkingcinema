var name = "directive.gameImage";
(function(name){
    var gameImage = function() {

    };

    gameImage.prototype.init = function(){
        this.cdn = $dc.globals.cdn;
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