var name = "directive.infiniteScroll";
(function(name){
    var infiniteScroll = function(){};

    infiniteScroll.prototype.init = function(){

    };

    $dc.addDirective({
        name: name,
        directive: infiniteScroll,
        template: "#dc-directive-infinite-scroll-template",
        $scope: {
            items: "items",
            itemTemplate: "@item-template"
        }

    });

})(name);