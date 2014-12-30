var name = "directive.searchInput";
(function (name){
    // format the search query
    var reg = /[^a-z0-9~%.:_\-+\&\'///]/g;
    var getUrl = function(query) {
        query = formatQuery(query).replace(reg, "");
        return query ? "/search/" + query : "";
    };

    var formatQuery = function(query){
        return encodeURI(query.replace(/\s+/g,"+"));
    };

    var defaults = {
        'change': function(e){
            var url = getUrl($.trim($(this).val()));
            $(this).trigger("updateAnchor", url);
            //url ? $a.attr("href", url) : $a.removeAttr("href");
        },
        'keyup': function(e){
            switch(e.keyCode){
                case 13:
                    // enter
                    var url = getUrl($.trim($(this).val()));
                    if (url) {
                        window.location.href = url;
                    }
                    break;
                case 27:
                    // escape
                    $(this).val("");
                    $(this).trigger("updateAnchor");
                    break;
                default:
                    break;
            }
        }
    };


    var searchInput = function(opts){
        // define the default event handlers for the input
        $.extend(this, opts);

        // get the input and anchor
        var $input = this.$el.find("input"),
            $a = this.$el.find("a");


        // set the event handlers
        $input.on("change", this.change)
            .on("keyup", this.keyup)
            .on("updateAnchor", function(e, url){
                url ? $a.attr("href", url) : $a.removeAttr("href");
            });

    };

    var fn = new function(){
        this.init = function(opts) {
            opts = this.formatOpts(opts, defaults);
            return opts ? new searchInput(opts) : undefined;
        }
    };

    $dc.extend(name, fn);
})(name);
