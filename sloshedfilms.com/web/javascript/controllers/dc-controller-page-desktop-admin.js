var name = "controller.page.desktop.admin";
(function(name){

    var controller = function(){
        this.init = function(){
            this._super();
            this.isAdmin = this.page.isAdmin;
        }
    };

    $dc.add(name, controller);
})(name);
