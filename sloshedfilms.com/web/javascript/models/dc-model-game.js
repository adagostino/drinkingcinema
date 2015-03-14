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
        var self = this;
        // b/c we use progress, we'll use xhr instead of ajax
        var xhr = new XMLHttpRequest();
        xhr.responseType = "json";
        xhr.upload.addEventListener("progress", function(e){
            console.log(e,xhr);
            var percent = $dc.utils.roundNum(100*(e.loaded / e.total), 3);
            self.$call.call(opts.$scope || self , opts.progress, e, percent);
        }, false);
        xhr.addEventListener("load", function(){
            xhr.status === 200 ? self.$call.call(opts.$scope || self , opts.success, xhr.response, xhr) : self.$call.call(opts.$scope || self, opts.error, xhr.response, xhr);
        });
        xhr.addEventListener("error", function(){
            self.$call.call(opts.$scope || self, opts.error, xhr.response, xhr);
        }, false);
        xhr.open("POST", "/api/game_api/image/name/" + $dc.utils.toUrl(opts.name || opts.file.name), true);
        xhr.setRequestHeader("X-FILENAME", opts.file.name);
        xhr.send(opts.file);
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