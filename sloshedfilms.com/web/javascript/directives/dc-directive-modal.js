var name = "directive.modal";
(function(name){
    var defaults = {
        'cancel': function(){
            this.hide();
        },
        'beforeShow': function(){
            //console.log("default before show");
        },
        'show': function(callback){
            this.beforeShow();
            this.open = true;
            this.$timeout(function(){
               this.afterShow(callback);
            });
        },
        'afterShow': function(callback){

        },
        'hide': function(callback){
            this.open = false;
            this.$timeout(function(){
                this.afterHide(callback);
            });

        },
        'afterHide': function(callback){
            //console.log("default after hide");
        }
    };

    var modal = function(opts){

        this.init = function(){
            this.open = false;
            this.modalTemplate = this.modalTemplate || $("#dc-directive-modal-template").html();
            this.$el = $dc.viewParser.parse(this.modalTemplate).getElement(this);
            $("body").append(this.$el);
        }

    };
    $dc.directive.add(name, {
        "directive": modal,
        "template": "#dc-directive-modal-template",
        "defaults": defaults
    });
})(name);