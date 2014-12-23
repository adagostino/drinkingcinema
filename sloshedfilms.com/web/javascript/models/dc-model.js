var name = "model";

(function(name){

    var model = $dc.subClass($dc, new function(){
        this.ajax = function(opts){
            console.log("in ajax");
        };

        this.test = function(){
            console.log("in parent");
        };

        this.add = function(name, inputModel){
            this.extend(name, $dc.subClass(this, inputModel));
        }

    });

    $dc.extend(name, model);
})(name);
