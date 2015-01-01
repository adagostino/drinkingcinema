var name = "controller";

(function(name){

    var controller = new function(){
        this.$dcType = "controller";
    };
    //$dc.extend(name, controller);
    $dc.add(name,controller);
})(name);
