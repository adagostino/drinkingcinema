var name = "directive.editable";
(function(name){

    var defaults = {
        processing: false,
        editing: false,
        onInput: function(e) {
            console.log("in here");
            this.content = this.$ce.html();
        },
        edit: function(e) {
            this.editing = true;
            this.oContent = this.content;
        },
        cancel: function(e) {
            this.editing = false;
            this.content = this.oContent;
        },
        submit: function(e) {
            console.log('submit', this);

        }
    };

    var editable = function(opts){
        var $scope = this;
        $.extend($scope, opts);
        this.$el = $dc.watchElement($scope.$el, $scope, $scope.template);
        this.$ce = this.$el.find("[contenteditable]");

        // set up the oContent variable to revert
        this.oContent = $scope.content;

        this.$watch("editing", function(n, o){
            if (n) {

            } else {

            }
        });

    };

    var fn = new function(){
        this.init = function(opts){
            opts = this.formatOpts(opts, defaults);
            return opts ? new editable(opts) : undefined;
        }
    };

    $dc.extend(name,fn);
})(name);
