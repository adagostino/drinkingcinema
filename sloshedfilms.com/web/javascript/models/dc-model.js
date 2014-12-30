var name = "model";

(function(name){

    var model = new function(){
        this.$dcType = "model";

        this.ajax = function(opts){
            console.log("in ajax");
            Platform.performMicrotaskCheckpoint();
        };

        this.test = function(){
            console.log("in parent");
        };
    };

    $dc.extend(name, model);
})(name);
