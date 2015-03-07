var name = "service.dataSource";
(function(name){
    var _maxResults = 1000000000;

    var source = function(opts){
        $.extend(this, opts);
        if (!this.items) this.items = this.data && this.data.results ? this.data.results : [];
        if (!this.bufferItems) this.bufferItems = [];
        if (!this.numResults) this.numResults = this.data && typeof this.data.numResults === "number" ? this.data.numResults : _maxResults;
        if (!this.increment) this.increment = 10;
        if (!this.buffer || this.buffer < this.increment) this.buffer = this.increment;

        // set up testing
        if (this.test) this.numResults = this.maxTestResults || _maxResults;

        this.fetching = false;
        this.endOfSet = this.items.length >= this.numResults;
        this.disabled = false;
        this.prevQueued = false;
        this.disableFetchingWatch = $dc.$watch.call(this,'fetching',function(n,o){
            if (!n && this.prevQueued){
                this.prev(this.prevQueued);
                this.prevQueued = false;
            }
        });

    };

    source.prototype.numItems = function(){
        return this.items.length + this.bufferItems.length;
    };

    source.prototype.getItemsFromBuffer = function(callback){
        // make sure fetching is set to true
        this.fetching = true;
        // get the items
        var items = this.bufferItems.splice(0,this.increment);
        // prepare the items to be spliced into this.items
        items.splice(0,0, this.items.length, 0);
        // splice the items into this.items
        Array.prototype.splice.apply(this.items, items);
        // call the callback
        $dc.$call.call(this, callback);
        // reset fetching after there's a chance to process the items
        $dc.$timeout.call(this,function(){
            this.fetching = false;
        });
        // prefetch some more items if necessary
        if (!this.endOfSet && this.bufferItems.length <= this.increment) this.get(1);
    };

    source.prototype.postProcess = function(data, dir, callback){
        dir = dir || 0;
        this.numResults = data.numResults;
        var itemsArray = dir < 0 ? this.items : this.bufferItems,
            idx = dir < 0 ? 0 : itemsArray.length,
            newItems = data.results;

        // set newItems up to be able to splice them into the itemsArray
        newItems.splice(0,0,idx,0);
        // splice them into the correct place
        Array.prototype.splice.apply(itemsArray,newItems);
        // now check if it's the end of the set
        this.endOfSet = this.numItems() >= this.numResults;
        // if we're fetching the next results, go grab the next "increment" from the buffer
        if (dir >=0) {
            this.getItemsFromBuffer(callback);
        } else {
            $dc.$call.call(this, callback);
            this.fetching = false;
        }
    };

    source.prototype.onSuccess = function(data, dir, callback){
        this.postProcess(data, dir, callback);
    };

    source.prototype.onError = function(){
        console.log("error getting", arguments);
    };

    source.prototype.testGet = function(dir, callback){
        var data = {
            numResults: this.maxTestResults || _maxResults,
            results: this.items.slice(0, dir < 0 ? this.increment : this.buffer)
        };
        this.onSuccess(data, dir, callback);
    };

    source.prototype.get = function(dir, callback){
        this.fetching = true;
        if (this.test) return this.testGet(dir, callback);
        var lastItem = dir < 0 ? this.items[0] : (this.bufferItems[this.bufferItems.length - 1] || this.items[this.items.length - 1]);
        $dc.$call.call(this, this.getter,function(data){
            this.onSuccess(data,dir,callback);
        }.bind(this),function(){
            this.onError.apply(this, arguments);
            this.fetching = false;
            $dc.$call.call(this,callback);
        }.bind(this), lastItem, dir);
    };

    source.prototype.next = function(callback){
        if (this.fetching || (this.endOfSet && !this.bufferItems.length) || this.disabled) return;
        this.bufferItems.length ? this.getItemsFromBuffer(callback) : this.get(1, callback);
    };

    source.prototype.prev = function(callback){
        if (this.fetching || this.disabled) {
            this.prevQueued = this.fetching && !this.disabled ? callback || true : false;
            return;
        }
        this.get(-1,callback);
    };

    $dc.addService(name, source);
})(name);