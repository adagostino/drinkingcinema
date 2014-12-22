var name = "search";
(function(name){
    var searchModel = $dc.subClass($dc.model, new function(){
        this.test = function(){
            this._super();
            console.log("sup y'all -- in the child!");
        }
    });

    $dc.model.extend(name, searchModel);
})(name);
