var name = "service.slide";
(function(){
    var _slideTemplates = {
        'image': {
            url: ''
        }
    };

    var slide = function(template) {
        this.template = typeof template === 'string' ? template : template.type;
        if (!this.template) this.template = 'image';
        $.extend(this, _slideTemplates[template], true);
        if (typeof template === 'object') {
            $.extend(this, template);
        }
    };

    slide.prototype.json = function(template, obj) {
        var type = !template && !obj ? this.template : '';
        var template = template || _slideTemplates[this.template],
            obj = obj || this;
        var o = $.isArray(template) ? [] : {};
        for (var key in template) {
            var value = template[key];
            if ($.isArray(value)) {
                o[key] = [];
                var objArray = obj[key];
                if (!$.isArray(objArray)) objArray = [];
                if (value.length <= 1) {
                    // then it's an array of templates
                    for (var i=0; i<objArray.length; i++) {
                        o[key].push(this.json(value[0]), objArray[i]);
                    }
                } else {
                    // then it's a set number of templates
                    for (var i=0; i<value.length; i++) {
                        o[key].push(this.json(value[i]), objArray[i]);
                    }
                }
            } else {
                o[key] = typeof value === 'object' ? this.json(value, obj[key]) : obj[key];
            }
        }
        if (type) {
            o.type = type;
        }
        return o;
    };

    $dc.addService(name, slide);
})(name);