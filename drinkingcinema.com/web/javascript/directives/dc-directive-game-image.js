var name = "directive.gameImage";
(function(name){
    var gameImage = function() {

    };

    gameImage.prototype.init = function(){
        this.cdn = $dc.utils.getCDN();
    };

    gameImage.prototype.fullImageClick = function(e) {
        $dc.ax.event($dc.ax.category.FULLIMAGE, $dc.ax.action.CLICK, this.game.name);
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