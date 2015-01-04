var name = "directive.searchInput";
(function (name){
    // format the search query
    var reg = /[^a-z0-9~%.:_\-+\&\'///]/g;
    var getUrl = function(query) {
        query = formatQuery($.trim(query)).replace(reg, "");
        return query ? "/search/" + query : "";
    };

    var formatQuery = function(query){
        return encodeURI(query.replace(/\s+/g,"+"));
    };

    var defaults = {
        'keyup': function(e){
            switch(e.keyCode){
                case 13:
                    // enter
                    var url = getUrl(this.content);
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
        }
    };


    var searchInput = function(opts){
        this.init = function(){
            this.href = "";
            this.$watch("content", function(n,o){
               this.href = getUrl(this.content);
            });
        }
    };
    $dc.directive.add(name, {
        "directive": searchInput,
        "defaults": defaults,
        "template": "#dc-directive-search-input-template"
    });
})(name);
