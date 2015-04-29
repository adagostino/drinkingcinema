var name = "service.analytics";
(function(name) {
    var _PLATFORMS = {
        "DESKTOP": 0,
        "MOBILE": 1,
        "TABLET": 2,
        "DEFAULT": 3
    };

    var _CATEGORIES = {
        "VENDOR": "vendor",
        "LIGHTBOX": "lightbox",
        "SUGGESTION": "suggested game",
        "COMMENT": "comment",
        "INFINITESCROLL": "infinite scroll",
        "FULLIMAGE": "full image",
        "SOCIAL": "social media"
    };

    var _ACTIONS = {
        "SHOW": "show",
        "HIDE": "hide",
        "CLICK": "click",
        "FOCUS": "focus",
        "BLUR": "blur",
        "DOUBLETAP": "double tap",
        "DOUBLETAP_IN": "double tap zoom in",
        "DOUBLETAP_OUT": "double tap zoom out",
        "PAN": "pan",
        "PINCH": "pinch",
        "CANCEL": "cancel",
        "ERROR": "error",
        "VALIDATION_ERROR": "validation error",
        "SEVER_ERROR": "server error",
        "SUBMIT": "submit"
    };

    var analytics = function(){
        this.platform = this.getPlatform();
        this.queue = [];
    };

    analytics.prototype.category = _CATEGORIES;
    analytics.prototype.action = _ACTIONS;

    analytics.prototype.getPlatform = function(){
        var platform = _PLATFORMS[($dc.utils.getPlatform() || "default").toUpperCase()];
        return typeof platform === "number" ? platform : _PLATFORMS["DEFAULT"];
    };

    analytics.prototype.event = function(category, action, label, value) {
        // FROM GOOGLE:
        // Value	Type	Required	Description
        // category	String	Yes	        Typically the object that was interacted with (e.g. button)
        // Action	String	Yes	        The type of interaction (e.g. click)
        // Label	String	No	        Useful for categorizing events (e.g. nav buttons)
        // Value	Number	No	        Values must be non-negative. Useful to pass counts (e.g. 4 times)

        // WHAT I'LL USE THEM FOR
        // category: engagement, or \
        // action: interaction
        // label: close
        // value: platform

        var o = {
            'hitType': 'event',
            'eventCategory': category ? category : "unknown",
            'eventAction': action ? action : "unknown",
            'eventLabel': label,
            'eventValue': this.platform
        };
        this.queue.push(o);
        this.send();
    };

    analytics.prototype.send = function(){
        if (!ga) return;
        while (this.queue.length) {
            var item = this.queue.pop();
            ga('send', item);
        }
    };



    $dc.addService(name, analytics);
})(name);