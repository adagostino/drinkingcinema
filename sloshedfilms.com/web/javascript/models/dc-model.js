var name = "model";

(function(name){

    var model = new function(){
        this.ajax = function(opts){
            console.log("in ajax");
        };

        this.test = function(){
            console.log("in parent");
        };

        this.extend = function(name,o){
            if (!name || !o) return;
            this[name] = o;
            return this;
        }
    };

    $dc.extend(name, model);
})(name);
