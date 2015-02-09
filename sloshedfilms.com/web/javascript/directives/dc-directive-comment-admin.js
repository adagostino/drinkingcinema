var name = "directive.comment.admin";
(function(name){
    var comment = function(){};

    comment.prototype.init = function(){
        this.isAdmin = true;

        this._super();
    };

    comment.prototype.editComment = function(){
        console.log(this.comment);
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