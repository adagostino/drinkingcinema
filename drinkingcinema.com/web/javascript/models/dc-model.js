var name = "model";

(function(name){

    var _pendingWrites = [],
        _writing = false;

    var _nextInQueue = function() {
        var next = _pendingWrites.shift();
        _writing = false;
        if (!next) return;
        next.model.ajax(next.options);
    };

    var model = function(){

    };

    model.prototype.setUrl = function(url, opts){
        for (var key in opts){
            if (typeof opts[key] === "number" || opts[key]) url+="/"+encodeURI(key)+"/"+encodeURI(opts[key]);
        }
        return url;
    };

    model.prototype.ajax = function(opts){
        var self = this;
        if (!opts.type) opts.type = "POST";

        var isWrite = opts.type === "POST" || opts.type === "PUT" || opts.type === "DELETE";
        if (isWrite && _writing) {
            _pendingWrites.push({
                options: opts,
                model: this
            });
            return;
        }

        if (isWrite) {
            _writing = true;
        }

        var sfn = opts.success;
        opts.success = function(response){
            self.$call.call(opts.$scope || $dc, sfn, response);
            if (isWrite) {
                _nextInQueue();
            }
        };
        var efn = opts.error;
        opts.error = function(xhr, txt) {
            var err;
            try {
                err = JSON.parse(xhr.responseText);
            } catch (e){
                err = xhr.responseText;
            }
            self.$call.call(opts.$scope || $dc, efn, err, xhr);
            if (isWrite) {
                _nextInQueue();
            }
        };
        if (!opts.url) opts.error(null, "no url provided for ajax");
        opts.type = opts.type.toUpperCase();
        if (opts.type === "GET") {
            if (opts.data){
                opts.url = this.setUrl(opts.url, opts.data);
                delete opts.data;
            }
        } else {
            if (!opts.data) opts.data = {};
            opts.data["dc_csrf"] = $dc.utils.getCookie("dc_csrf");
        }
        return $.ajax(opts);
    };

    model.prototype.postImage = function(opts){
        var self = this;
        if (!opts.url || !opts.file) {
            var errorMsg = !opts.url ? "no url provided for ajax" : "options passed to model did not have 'file' key/value.";
            self.$call.call(opts.$scope || self, opts.error, null, errorMsg);
            return;
        }
        // b/c we use progress, we'll use xhr instead of ajax
        var xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", function(e){
            var percent = $dc.utils.roundNum(100*(e.loaded / e.total), 3);
            self.$call.call(opts.$scope || self , opts.progress, e, percent);
        }, false);
        xhr.addEventListener("load", function(){
            xhr.status === 200 ? self.$call.call(opts.$scope || self , opts.success, xhr.response, xhr) : self.$call.call(opts.$scope || self, opts.error, xhr.response, xhr);
        });
        xhr.addEventListener("error", function(){
            self.$call.call(opts.$scope || self, opts.error, xhr.response, xhr);
        }, false);
        var queryString="?dc_csrf="+$dc.utils.getCookie("dc_csrf");
        xhr.open("POST", opts.url + queryString, true);
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.setRequestHeader("X-FILENAME", opts.file.name);
        xhr.setRequestHeader("Content-Type", "application/octet-stream");
        xhr.send(opts.file);
    };

    $dc.add(name, model);
})(name);
