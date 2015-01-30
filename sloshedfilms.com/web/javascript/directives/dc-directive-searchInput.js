var name = "directive.searchInput";
(function (name){
    // format the search query
    var _formatQuery = function(query){
        return encodeURI(query.replace(/\s+/g,"+"));
    };

    var reg = /[^a-z0-9~%.:_\-+\&\'///]/g;
    var _getUrl = function(query) {
        query = _formatQuery($.trim(query)).replace(reg, "");
        return query ? "/search/" + query : "";
    };

    var searchInput = function(){};

    searchInput.prototype.init = function(){
        this.href = "";
        this.$watch("content", function(n,o){
            this.href = _getUrl(this.content);
        });
    }

    searchInput.prototype.onKeyup = function(e){
        switch(e.keyCode){
            case 13:
                // enter
                var url = _getUrl(this.content);
                if (url) {
                    window.location.href = url;
                }
                break;
            case 27:
                // escape
                this.content = "";
                break;
            default:
                break;
        }
    };

    $dc.addDirective({
        name: name,
        directive: searchInput,
        template: "#dc-directive-search-input-template",
        $scope: {
            content: "content"
        }
    });

})(name);
