var name = "model.game";
(function(name){
    var gameModel = function(){};

    gameModel.prototype.postThumbnail = function(opts){
        //if (!opts.coords || !opts.name || !opts.coords.w) this.call.call(opts.$scope, opts.error, null, "the dimensions or the name wasn't specified or the width was 0");
        opts.url = "/api/game_api/thumbnail";
        opts.data = {
            name: opts.name,
            coords: opts.coords
        };
        this.ajax(opts);
    };

    gameModel.prototype.postImage = function(opts){
        opts.url = "/api/game_api/image/name/" + $dc.utils.toUrl(opts.name || opts.file.name);
        this._super(opts);
    };

    gameModel.prototype.putGame = function(opts) {
        opts.url = "/api/game_api/game";
        opts.type = "PUT";
        opts.data = {};
        opts.data.game = {
            name: opts.game.name,
            tags: opts.game.tags,
            rules: opts.game.rules,
            optionalRules: opts.game.optionalRules
        };
        this.ajax(opts);
    };

    gameModel.prototype.postGameUpdate = function(opts) {
        opts.url = "/api/game_api/game_update";
        opts.data = {};
        opts.data.game = opts.game;
        this.ajax(opts);
    };

    $dc.add(name,gameModel);
})(name);