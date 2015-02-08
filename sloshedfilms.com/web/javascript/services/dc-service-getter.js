var name = "service.getter";
(function(name){
    var getter = function(opts){
        $.extend(this, opts);
        if (!this.items) this.items = [];

        this.fetching = false;
        this.endOfSetNext = false;
        this.disabled = false;
    };


    getter.prototype.get = function(increment){
        var self = this,
            currItem = increment < 0 ? this.items[0] : this.items[this.items.length - 1];

        this.fetching = true;
        var opts = {
            'increment': increment,
            success: function(newItems){
                var idx = increment < 0 ? 0 : self.items.length;
                if (newItems.length < Math.abs(increment) && increment > 0){
                    self.endOfSetNext = true;
                };
                newItems.splice(0,0,idx,0);
                Array.prototype.splice.apply(self.items,newItems);
                self.fetching = false;
            },
            error: function(){
                console.log("error getting");
                self.fetching = false;
            }
        };
        var customOpts = $dc.$call.call(this, this.setModelOpts, currItem, increment) || {};

        $.extend(true, opts,customOpts);
        (this.modelFunc && this.model) && this.model[this.modelFunc](opts);
    };

    getter.prototype.next = function(){
        (!this.endOfSetNext && !this.fetching && !this.disabled) && this.get(this.increment);
    };

    getter.prototype.prev = function(){
        // can't ever have a "end of set prev" as there can always be new things added
        (!this.fetching && !this.disabled) && this.get(-this.increment);
    };

    $dc.addService(name,getter);
})(name);