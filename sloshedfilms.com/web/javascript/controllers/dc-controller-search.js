var name = "controller.search";
(function(name){
    var controller = function(){
        var $scope;

        this.init = function(){
            $scope = this;
            this.results = $dc.utils.getJSON('searchJSON', 'dc-search-json');

            //this.results = $dc.utils.obj2array($dc.utils.getJSON('searchJSON','dc-search-json'));
            var pathname = window.location.pathname.split('/');
            this.searchTerms = pathname[2];

            window.$scope = this;

            this.searchSource = new $dc.service.dataSource({
                'increment': 10,
                'buffer': 50,
                'data': this.results,
                'getter': function(success, error, lastItem, dir){
                    $dc.model.search.get({
                        'searchTerms': $scope.searchTerms,
                        'limit': this.buffer,
                        'offset': this.numItems(),
                        'success': success,
                        'error': error

                    })
                }
            });

        };

    };

    $dc.add(name,controller);
})(name);