var name = "directive.searchInput";
(function (name){
    var searchInput = function(opts){
        // define the default event handlers for the input
        var defaults = {
            'change': function(e){
                var url = getUrl($.trim($(this).val()));
                url ? $a.attr("href", url) : $a.removeAttr("href");
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
                        $a.removeAttr("href");
                        break;
                    default:
                        break;
                }
            }
        };
        // extend the options
        $.extend(opts, defaults);
        // just so it's easier
        var $el = opts.$el || opts.$element || opts.element || opts.el;
        if (!$el) return;

        // get the input and anchor
        var $input = $el.find("input"),
            $a = $el.find("a");

        // set the event handlers
        $input.on("change", opts.change).on("keyup", opts.keyup);

        // format the search query
        var reg = /[^a-z0-9~%.:_\-+\&\'///]/g;
        var getUrl = function(query) {
            query = formatQuery(query).replace(reg, "");
            return query ? "/search/" + query : "";
        };

        var formatQuery = function(query){
            return encodeURI(query.replace(/\s+/g,"+"));
        }

    };

    var fn = new function(){
        this.init = function(opts) {
            return opts ? new searchInput(opts) : null;
        }
    };

    $dc.extend(name, fn);
})(name);
