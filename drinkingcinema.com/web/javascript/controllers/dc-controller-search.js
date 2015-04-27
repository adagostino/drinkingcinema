var name = "controller.search";
(function(name){
    var controller = function(){
        var $scope;

        this.init = function(){
            $scope = this;
            this.page = $dc.utils.getJSON('pageJSON', 'dc-page-json');
            this.results = this.page.results;
            this.searchTerms = this.page.searchTerms;

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