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

        this.uploadGameImage = function(opts){
            var self = this;
            console.log(self);
            // b/c we use progress, we'll use xhr instead of ajax
            var xhr = new XMLHttpRequest();
            xhr.responseType = "json";
            xhr.upload.addEventListener("progress", function(e){
                var percent = _roundNum(100*(e.loaded / e.total), 3);
                self.call.call(opts.$scope || self , opts.progress, e, percent);
            }, false);
            xhr.onreadystatechange = function(e) {
                if (xhr.readyState === 4) {
                    return xhr.status === 200 ? self.call.call(opts.$scope || self , opts.success, xhr.response) : self.call.call(opts.$scope || self, opts.error, xhr);
                }
            };
            xhr.open("POST", "/api/game_api/image", true);
            xhr.setRequestHeader("X-FILENAME", this.toUrl(opts.name || opts.file.name));
            xhr.send(opts.file);



        }

    };
    $dc.extend(name,gameModel);
})(name);