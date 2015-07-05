var name = "service.imageUploader";
(function(){

    var _getOptions = function(opts, image) {
        return {
            'loaded': opts.loaded,
            'success': opts.success,
            'error': opts.error,
            'preprocess': opts.preprocess,
            '$scope': opts.$scope,
            'file': image
        };
    };

    var imageUploader = function(opts){
        $.extend(this, opts);
        if (typeof this.uploader === "string") {
            var ua = this.uploader.split(".");
            var ufn = ua.pop();
            var model = Path.get(ua.join(".")).getValueFrom($dc);
            this.uploadFn = function() {
                this[ufn].apply(this, arguments);
            }.bind(model);
        } else {
            this.uploadFn = this.uploader;
        }

    };

    imageUploader.prototype.getImagesFromFiles = function(files) {
        if (!files) return [];
        files = files.length ? files : [files];
        var imageInds = [];
        for (var i=0; i<files.length; i++) {
            /^image/.test(files[i].type) && imageInds.push(i);
        }
        return imageInds;
    };

    imageUploader.prototype.preprocess = function(opts) {
        if (!opts.file) $dc.$call.call(opts.$scope || $dc, opts.preprocess, null);
        var reader = new FileReader();
        reader.onloadend = function() {
            var url = reader.result;
            $dc.$call.call(opts.$scope || $dc, opts.preprocess, url);
        };
        reader.readAsDataURL(opts.file);
    };

    imageUploader.prototype.upload = function(opts) {
        if (!opts.$scope) opts.$scope = this.$scope;
        var pFn = opts.preprocess,
            sFn = opts.success;

        opts.success = function(data) {
            if (typeof data === 'string' && opts.loaded) {
                data = JSON.parse(data);
                var img = new Image();
                $(img).one("load",function(e){
                    $dc.$call.call(opts.$scope || $dc, opts.loaded, data);
                });
                img.src = data;
            }
            $dc.$call.call(opts.$scope || $dc, sFn, data);

        };

        opts.preprocess = function(url) {
            $dc.$call.call(opts.$scope || $dc, pFn, url);
            this.uploadFn(opts);
        }.bind(this);

        pFn ? this.preprocess(opts) : this.uploadFn(opts);
    };

    imageUploader.prototype.uploadImage = function(opts) {
        var imageInds = this.getImagesFromFiles(opts.files || opts.file);
        !imageInds.length && imageInds.push(-1);
        var options = _getOptions(opts, opts.files.item(imageInds[0]));
        this.upload(options);
    };


    $dc.addService(name, imageUploader);
})(name);