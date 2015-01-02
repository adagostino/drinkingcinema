var name = "directive.modal";
(function(name){
    var defaults = {
        'cancel': function(){
            this.hide();
        },
        'beforeShow': function(){
            console.log("default before show");
        },
        'show': function(){
            this.beforeShow();
            this.open = true;
        },
        'hide': function(){
            this.open = false;
            this.afterHide();
        },
        'afterHide': function(){
            console.log("default after hide");
        }
    };

    var modal = function(opts){

        this.init = function(){
            this.open = false;
            this.modalTemplate = this.modalTemplate || $("#dc-directive-modal-template").html();
            this.$el = $dc.parseView(this.modalTemplate).getElement(this);
            $("body").append(this.$el);
        }

    };
    $dc.directive.add(name, modal, defaults);
})(name);