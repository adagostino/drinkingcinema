var name = "directive.embedGame";
(function(name){
    var embedGame = function(){
        var _originalEmbedText;

        this.init = function(){
            _originalEmbedText = '<iframe width="430px" height="590px" src="http://drinkingcinema.com/embed/' + this.game.name  + ' frameborder="0"></iframe>';
            this.embedText = _originalEmbedText;
            this.showing = false;
        };

        this.onBlur = function(){
            this.hasFocus = false;
            this.embedText = _originalEmbedText;
        };

    };

    embedGame.prototype.showContent = function(){
        if (this.showing) return;
        this.showing = true;
    };

    embedGame.prototype.hideContent = function(e){
        this.showing = false;
        e.stopPropagation();
        e.preventDefault();
    };

    embedGame.prototype.onFocus = function(e){
        $(e.target).select();
        this.hasFocus = true;
    };



    $dc.addDirective({
        name: name,
        directive: embedGame,
        template: "#dc-directive-embed-game-template",
        $scope: {
            'game': 'game'
        }
    });
})(name);