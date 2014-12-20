var name = "model";
(function(name){
    $dc.extend(name, $dc.subClass(new function(){
        // basic ajax function to use
        this.ajax = function(opts){
            console.log(opts);
        };
    }));
})(name);
