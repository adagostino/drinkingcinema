var name = "directive";
(function(name){
    var directive = new function(){
        this.$dcType = "directive";
    };
    $dc.extend(name, directive);
})(name);