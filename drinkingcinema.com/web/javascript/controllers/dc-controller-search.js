var name = "controller.search";
(function(name){
    var controller = function(){
        var $scope;

        this.init = function(){
            $scope = this;
            this.page = $dc.utils.getJSON('pageJSON', 'dc-page-json');
            this.results = this.page.results;
            this.searchTerms = this.page.searchTerms;
            this.recordInfiniteScrollAx = false;

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

                    });
                    $scope.replaceHistory = true;
                    $scope.recordInfiniteScrollAx = true;
                }
            });

            $(window).on("unload", function(){
                this.$call(this.onPop);
                this.$call(this.onUnload);
            }.bind(this));
        };

        this.onUnload = function(){
            this.recordInfiniteScrollAx && $dc.ax.event($dc.ax.category.INFINITESCROLL, "Search for: " + this.searchTerms, this.searchSource.items.length);
        };

        this.onPop = function() {
            if (!this.replaceHistory) return;
            $dc.$location.search({
                'n': this.searchSource.items.length
            });
        };

    };

    $dc.add(name,controller);
})(name);