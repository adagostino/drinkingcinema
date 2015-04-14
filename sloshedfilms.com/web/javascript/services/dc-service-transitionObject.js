var name = "service.transitionObject";
(function(){

    var transitionObject = function($el) {
        this.vendorPrefix =  $dc.utils.getVendorPrefix();
        this.transitionAttr = this.vendorPrefix + "transition";
        if ($el) this.transitions = this.parseTransition($el.css(this.transitionAttr));
    };

    transitionObject.prototype.parseTransition = function(transitionStr) {
        var transition = /([\w\-]+)\s+(\d*\.*\d*)(s|ms)\s+([\w\-]+\(*[\d\.\,\s]*\)*)\s+(\d*\.*\d*)(s|ms)/i,
            transitions = new RegExp(transition.toString().replace(/^\//, "").replace(/\/\w*$/,""), "ig");

        var transitionObject = {};
        transitionStr.replace(transitions, function(transitionMatch){
            transitionMatch.replace(transition, function(match, attr, duration, durationUnit, easing, delay, delayUnit) {
                transitionObject[attr] = {
                    duration: durationUnit === "s" ? parseFloat(duration)*1000 : parseFloat(duration),
                    durationUnit: "ms",
                    easing: easing,
                    delay: delayUnit === "s" ? parseFloat(delay)*1000 : parseFloat(delay),
                    delayUnit: "ms",
                    transition: transitionMatch
                };
            });
        });
        return transitionObject;
    };

    transitionObject.prototype.stringifyTransition = function(transitionObj) {
        var str = "";
        for (var attr in transitionObj) {
            if (str) str+=", ";
            var trans = transitionObj[attr];
            str+= attr + " " + trans.duration + trans.durationUnit + " " + trans.easing + " " + trans["delay"] + trans.delayUnit;
        }
        return str;
    }

    //*** convenience methods to get and set transform/transitions on elements ***//
    transitionObject.prototype.setDurationOnElement = function($el, time) {
        var currTrans = this.parseTransition($el.css(this.transitionAttr));
        var treg = /(\d*\.*\d*)(s|ms)/,
            tmatch = time.match(treg),
            tfloat = tmatch[1];
        if (tmatch[2]) {
            tfloat*= tmatch[2] === "s" ? 1000 : 1;
        }

        for (var attr in currTrans) {
            currTrans[attr].duration = tfloat;
        }
        var transition = this.stringifyTransition(currTrans);
        $el.css(this.transitionAttr, transition);

    };

    transitionObject.prototype.removeTransitionFromElement = function($el) {
        $el.css(this.transitionAttr, "");
    }


    $dc.addService(name, transitionObject);
})(name);