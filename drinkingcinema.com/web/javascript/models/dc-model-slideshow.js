var name = "model.slideshow";
(function(name){
    var slideshowModel = function(){};

    slideshowModel.prototype.postSlideshow = function(opts) {
        opts.url = "/api/slideshow_api/slideshow";
        opts.type = "POST";
        opts.data = {};
        opts.data.slideshow = {
            name: opts.slideshow.name
        }
        this.ajax(opts);
    };

    slideshowModel.prototype.putUpdate = function(opts) {
        opts.url = "/api/slideshow_api/slideshow_update";
        opts.type = "PUT";
        opts.data = {};
        opts.data.slideshow = opts.slideshow;
        this.ajax(opts);
    };

    $dc.add(name, slideshowModel);
})(name);