var name = "service.location";
(function(){
    var _queryReg = /([^\?^&^=^#]+)=*([^\?^&^=^#]*)&*/g;

    var _getTitle = function() {
        var tags = document.getElementsByTagName("title"),
            tag = tags && tags.length ? tags[0] : undefined;
        return tag ? (tag.innerText || "") : "";
    };

    var _getOrigin = function() {
        return location.origin || location.protocol + "//" + location.hostname + (location.port ? ':' + location.port: '');
    };

    var _getSearchParams = function(inputParams) {
        var params = {};
        inputParams !== "" && location.search.replace(_queryReg, function(m, $1, $2){
            if ($1) params[$1] = $2;
        });
        if (inputParams === "" || inputParams) {
            for (var key in inputParams) {
                if (inputParams[key]) {
                    params[key] = inputParams[key];
                } else {
                    delete params[key];
                }
            }
        };
        return params;
    };

    var _stringifySearchParams = function(params) {
        var str = "";
        for (var key in params) {
            if (str) str+="&";
            str+= key + (params[key] ? "=" + params[key] : "");
        }
        return str ? "?" + str : str;
    };

    var locationService = function(){};

    locationService.prototype.buildUrl = function(opts) {
        var url = (opts.relative ? "" : _getOrigin()) + location.pathname;
        url += _stringifySearchParams(_getSearchParams(opts.search)) + location.hash;
        return url;
    };

    locationService.prototype.buildRelativeUrl = function(opts) {
        opts.relative = true;
        return this.buildUrl(opts);
    };

    locationService.prototype.replace = function(opts) {
        try {
          var state = opts.state || {},
              title = opts.title || _getTitle(),
              url = opts.url || this.buildUrl(opts);
          history.replaceState(state, title, url);
        } catch (e) {
            console.log(e);
        };
    };

    locationService.prototype.search = function(searchParams) {
        var params = _getSearchParams(searchParams);
        if (searchParams === "" || searchParams) {
            this.replace({
                search: params,
                relative: true
            });
        };
        return params;
    };



    $dc.addService(name, locationService);
})(name);