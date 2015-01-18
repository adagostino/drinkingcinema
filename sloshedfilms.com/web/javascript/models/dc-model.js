var name = "model";

(function(name){

    var model = new function(){
        this.$dcType = "model";

        this.getJSON = function(json, id){
            if (!window[json]) return;
            var nJSON = $.extend(true,{},window[json]);
            delete window[json];
            $("#"+id).remove();
            return nJSON;
        }


        this.call = function(fn) {
            if (typeof fn !== "function") return;
            var scope = this;
            fn.apply(scope, Array.prototype.slice.call(arguments, 1));
            Platform.performMicrotaskCheckpoint();
        };

        this.setUrl = function(url, opts){
            for (var key in opts){
                url+="/"+encodeURI(key)+"/"+encodeURI(opts[key]);
            }
            return url;
        };

        this.ajax = function(opts){
            var self = this;
            var defaults = {
                type: "POST"
            };

            $.extend(opts, defaults);
            var sfn = opts.success;
            opts.success = function(response){
                self.call.call(opts.$scope || $dc, sfn, response);
            };
            var efn = opts.error;
            opts.error = function(xhr, txt) {
                var err;
                try {
                    err = JSON.parse(xhr.responseText);
                } catch (e){
                    err = xhr.responseText;
                }

                self.call.call(opts.$scope || $dc, efn, err, xhr);
            };
            if (!opts.url) opts.error(null, "no url provided for ajax");
            opts.type = opts.type.toUpperCase();
            if (opts.type === "GET" && opts.data) {
                opts.url = this.setUrl(opts.url, data);
                delete opts.data;
            }
            return $.ajax(opts);
        };

        this.test = function(){
            console.log("in parent");
        };
    };

    //$dc.extend(name, model);
    $dc.add(name, model);
})(name);
