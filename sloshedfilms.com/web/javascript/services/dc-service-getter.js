var name = "service.getter";
(function(name){
    var getter = function(opts){
        $.extend(this, opts);
        if (!this.items) this.items = [];
        if (!this.bufferItems) this.bufferItems = [];
        if (!this.buffer || this.buffer < this.increment) this.buffer = this.increment;
        this.fetching = false;
        this.endOfSetNext = false;
        this.endOfSet = false;
        this.disabled = false;
    };

    getter.prototype.testGet = function(increment, callback) {
        var self = this,
            currItem = increment < 0 ? this.items[0] : this.items[this.items.length - 1];

        var customOpts = $dc.$call.call(this, this.setModelOpts, currItem, increment) || {};

        var newItems = $.extend(true,[],this.items.slice(0,Math.abs(increment)));

        var idx = increment < 0 ? 0 : self.items.length;

        newItems.splice(0,0,idx,0);
        Array.prototype.splice.apply(self.items,newItems);
        self.fetching = false;
        $dc.$call.call(customOpts.$scope ||this,callback);
    };

    getter.prototype.get = function(increment, callback){
        var self = this,
            currItem = increment < 0 ? this.items[0] : this.items[this.items.length - 1],
            serverInc = increment < 0 ? increment : self.buffer;

        this.fetching = true;

        var opts = {
            'increment': serverInc,
            success: function(newItems){
                // if it's prev, then append to items directly, otherwise append to the buffer
                var a = increment < 0 ? self.items : self.bufferItems;
                var idx = increment < 0 ? 0 : a.length;

                if (newItems.length < Math.abs(serverInc) && serverInc > 0){
                    self.endOfSetNext = true;
                };

                newItems.splice(0,0,idx,0);
                Array.prototype.splice.apply(a,newItems);
                self.fetching = false;
                // if appended to the buffer, then grab the increment amount and shove it onto the items
                if (increment > 0){
                    self.getItemsFromBuffer();
                }
                $dc.$call.call(this,callback);
            },
            error: function(){
                console.log("error getting", arguments);
                self.fetching = false;
            }
        };
        var customOpts = $dc.$call.call(this, this.setModelOpts, currItem, increment) || {};

        $.extend(true, opts,customOpts);
        if (this.modelFunc && this.model && !this.bufferItems.length){
            this.model[this.modelFunc](opts);
        } else {
            this.getItemsFromBuffer();
            this.fetching = false;
            $dc.$call.call(opts.$scope || this, callback);
        }

    };

    getter.prototype.getItemsFromBuffer = function(){
        var items = this.bufferItems.splice(0,this.increment);
        items.splice(0,0, this.items.length, 0);
        Array.prototype.splice.apply(this.items, items);
        this.endOfSet = this.endOfSetNext && !this.bufferItems.length;
    };

    getter.prototype.next = function(callback){
        (!this.endOfSet && !this.fetching && !this.disabled) && this.get(this.increment, callback);
    };

    getter.prototype.prev = function(callback){
        // can't ever have a "end of set prev" as there can always be new things added
        (!this.fetching && !this.disabled) && this.get(-this.increment, callback);
    };

    getter.prototype.test = function(callback){
        (!this.endOfSetNext && !this.fetching && !this.disabled) && this.testGet(this.increment, callback);
    };

    $dc.addService(name,getter);
})(name);