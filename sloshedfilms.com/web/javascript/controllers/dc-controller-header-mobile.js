var name = "controller.header.mobile";
(function(name){
    var controller = function(){
        var $scope;
        this.init = function(){
            this._super();
            $scope = this;
        };

        this.getSearchResults = function(searchTerms){
            $dc.model.search.get({
                'searchTerms': searchTerms,
                'offset': 0,
                'limit': 10,
                '$scope': this,
                'success': function(results){
                    for (var i=0; i<results.numResults; i++) {
                        results.results[i].id = results.results[i].nameUrl;
                    }

                    this.setResults(results.results, searchTerms);
                },
                'error': function(){
                    console.log(arguments);
                }
            });
        };
    };

    $dc.add(name, controller);
})(name);