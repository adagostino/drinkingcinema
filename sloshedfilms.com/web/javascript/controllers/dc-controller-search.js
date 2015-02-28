var name = "controller.search";
(function(name){
    var controller = function(){
        var $scope;

        this.init = function(){
            $scope = this;
            this.results = $dc.utils.obj2array($dc.utils.getJSON('searchJSON','dc-search-json'));

            var pathname = window.location.pathname.split('/');
            this.searchTerms = pathname[2];

            window.$scope = this;

            this.searchGetter = new $dc.service.getter({
                increment: 10,
                buffer: 50,
                items: this.results,
                model: $dc.model.search,
                modelFunc: "get",
                setModelOpts: function(currItem){
                    return {
                        '$scope': $scope,
                        'searchTerms': $scope.searchTerms,
                        'limit': this.buffer,
                        'offset': this.items.length
                    }
                }
            });

        };

    };

    $dc.add(name,controller);
})(name);