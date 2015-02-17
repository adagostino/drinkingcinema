var name = "directive.comment";
(function(name){
    var comment = function(){};

    comment.prototype.init = function(){

    };

    comment.prototype.flag = function(){

    };

    $dc.addDirective({
        name: name,
        directive: comment,
        template: "#dc-directive-comment-template",
        $scope: {
            'comment': 'comment'
        }
    });

})(name);