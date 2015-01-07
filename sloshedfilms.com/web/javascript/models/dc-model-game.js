var name = "model.game";
(function(name){
    var _roundNum = function(num, dec){
        var sign = num < 0 ? -1 : 1,
            pow = Math.pow(10, dec || 0);
        return sign * Math.round(sign*num*pow)/pow;
    }


    var gameModel = new function(){

        this.toUrl = function(str){
            str = str.replace(/\s+/g,"+");
            return encodeURI(str);
        };

        this.postThumbnail = function(opts){
            if (!opts.coords || !opts.name || !opts.coords.w) this.call.call(opts.$scope, opts.error, null, "the dimensions or the name wasn't specified or the width was 0");
            opts.url = "/api/game_api/thumbnail";
            opts.data = {
                name: this.toUrl(opts.name),
                coords: opts.coords
            };
            this.ajax(opts);
        };

        this.postImage = function(opts){
            var self = this;
            console.log(self);
            // b/c we use progress, we'll use xhr instead of ajax
            var xhr = new XMLHttpRequest();
            xhr.responseType = "json";
            xhr.upload.addEventListener("progress", function(e){
                var percent = _roundNum(100*(e.loaded / e.total), 3);
                console.log(percent);
                self.call.call(opts.$scope || self , opts.progress, e, percent);
            }, false);
            xhr.addEventListener("load", function(){
                self.call.call(opts.$scope || self , opts.success, xhr.response)
            });
            xhr.addEventListener("error", function(){
                self.call.call(opts.$scope || self, opts.error, xhr);
            }, false);
            xhr.open("POST", "/api/game_api/image/name/" + this.toUrl(opts.name || opts.file.name), true);
            xhr.setRequestHeader("X-FILENAME", opts.file.name);
            xhr.send(opts.file);
        }

    };
    $dc.extend(name,gameModel);
})(name);