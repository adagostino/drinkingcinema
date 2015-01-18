var name = "directive.tooltip";
(function(name){

    var defaults = {

    };

    var tooltip = function(opts){

        this.init = function(){
            //console.log(this.$el[0])
            //this.$el.attr("color", "green");

            //this.open = false;
            //this.modalTemplate = this.modalTemplate || $("#dc-directive-modal-template").html();
            //this.$el = $dc.viewParser.parse(this.modalTemplate).getElement(this);

            //this.paddingRight;
            //$(".dc-container").append(this.$el);
            //console.log("tooltip init", arguments);


        }

    };
    $dc.directive.add(name, {
        "directive": tooltip,
        //"template": "#dc-directive-tooltip-template",
        "defaults": defaults
    });

})(name)