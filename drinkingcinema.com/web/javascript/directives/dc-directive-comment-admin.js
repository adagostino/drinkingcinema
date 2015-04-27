var name = "directive.comment.admin";
(function(name){
    var comment = function(){};

    comment.prototype.init = function(){
        this.isAdmin = true;
        this._super();
    };

    $dc.addDirective({
        name: name,
        directive: comment,
        template: "#dc-directive-comment-template",
        $scope: {
            'comment': '=comment',
            'edit': '&comment-edit',
            'remove': '&comment-remove'
        }
    });
})(name);