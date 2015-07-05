var name = "model.search";
(function(name){
    var searchModel = function(){};

    searchModel.prototype.get = function(opts){
        var table = opts.table || "games";
        opts.url = "/api/search_api/search_" + table;
        opts.data = {
            'searchTerms': opts.searchTerms || "newest",
            'offset': opts.offset,
            'limit': opts.limit
        };
        this.ajax(opts);
    };

    $dc.add(name,searchModel);
})(name);