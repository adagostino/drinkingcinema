var name = "directive.embedGame";
(function(name){
    var embedGame = function(){};

    embedGame.prototype.init = function(){
        this.embedText = '<iframe width="430px" height="590px" src="http://drinkingcinema.com/embed/' + this.game.name  + ' frameborder="0"></iframe>';
        this.showing = false;
    };

    embedGame.prototype.showContent = function(){
        if (this.showing) return;
        this.showing = true;
    };

    embedGame.prototype.hideContent = function(e){
        this.showing = false;
        e.stopPropagation();
        e.preventDefault();
    }

    $dc.addDirective({
        name: name,
        directive: embedGame,
        template: "#dc-directive-embed-game-template",
        $scope: {
            'game': 'game'
        }
    });
})(name);