var name = "search";
(function(name){
    var searchModel = new function(){
        this.test = function(){
            this._super();
            console.log("sup y'all -- in the child!");

        };
    };

    $dc.model.add(name,searchModel);
})(name);
