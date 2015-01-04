var name = "watchElement";
(function(name){
    var _we = function($el, o, template){
        template = template || $el[0].outerHTML;
        // TODO: do this non-destructively sometime
        var $nEl = $dc.viewParser.parse(template).getElement(o);
        var events = jQuery._data($el[0], 'events'),
            data = jQuery._data($el[0], 'data');
        // copy pre-existing events over
        for (var event in events){
            for (var i=0; i<events[event].length; i++){
                (function(event, fn){
                    $nEl.on(event, fn);
                })(event, events[event][i]);
            }
        };
        // copy pre-existing data over
        for (var key in data){
            $nEl.data(key, data[key]);
        };

        $el.replaceWith($nEl);
        return $nEl;

    };

    $dc[name] = _we;
})(name);
