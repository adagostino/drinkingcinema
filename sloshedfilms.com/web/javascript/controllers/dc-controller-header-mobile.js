var name = "controller.header.mobile";
(function(name){
    var controller = function(){
        this.init = function(){
            this._super();
        };

        this.showAutocomplete = function(){
            console.log("show autocomplete");
        }
    };

    $dc.add(name, controller);
})(name);