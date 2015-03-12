var name = "model.page";
(function(name){
    var pageModel = function(){};

    pageModel.prototype.postUpdate = function(opts){
        opts.url = "/api/page_api/page_update";
        opts.type = "POST";
        opts.data = {
            page: {
                pageName: opts.pageName,
                content: opts.content
            }
        };
        this.ajax(opts);
    };

    $dc.add(name,pageModel);
})(name);