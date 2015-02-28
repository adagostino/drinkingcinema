var name = "model.search";
(function(name){
    var searchModel = function(){};

    searchModel.prototype.get = function(opts){
        opts.url = "/api/search_api/search_games";
        opts.type = "GET";
        opts.data = {
            'searchTerms': opts.searchTerms || "newest",
            'offset': opts.offset,
            'limit': opts.limit
        };
        this.ajax(opts);
    };

    $dc.add(name,searchModel);
})(name);