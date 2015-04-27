var name = "controller.header";
(function(name){

    var controller = function(){
        this.init = function(){
            this.page = $dc.utils.getJSON('pageJSON', 'dc-page-json');
            this.searchText = "";
        };

        this.selectAll = function(e){
            this.$timeout(function(){$(e.target).select()});
        };

        this.revertShare = function(e){
            $(e.target).val(this.page.share.value);
        }
    };

    $dc.add(name, controller);
})(name);