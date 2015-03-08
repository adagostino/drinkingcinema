var name = "model";

(function(name){

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

        var sfn = opts.success;
        opts.success = function(response){
            self.$call.call(opts.$scope || $dc, sfn, response);
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
        };
        if (!opts.url) opts.error(null, "no url provided for ajax");
        opts.type = opts.type.toUpperCase();
        if (opts.type === "GET" && opts.data) {
            opts.url = this.setUrl(opts.url, opts.data);
            delete opts.data;
        }
        return $.ajax(opts);
    };

    $dc.add(name, model);
})(name);
