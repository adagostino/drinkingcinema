(function(global){
    var generateGUID =  global.generateGUID = function (guidLength, includeDate) {
        includeDate = typeof includeDate === "boolean" ? includeDate : true;
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split(''),
            charsLength = chars.length,
            guid = includeDate ? new Date().getTime() + '_' : '';

        guidLength = guidLength || 16;

        for (var i = 0; i < guidLength; i++) {
            guid += chars[Math.floor(Math.random() * charsLength)];
        }

        return guid;
    };
})(this || window);