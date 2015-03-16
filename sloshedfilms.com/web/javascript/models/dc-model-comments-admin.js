var name = "model.comments.admin";
(function(name){
    var commentModel = function(){};

    commentModel.prototype.postCommentUpdate = function(opts) {
        opts.url = "/api/comments_api/comment_update";
        opts.data = {};
        opts.data.comment = opts.comment;
        opts.data.comment.comment = $.trim(opts.data.comment.comment);
        this.ajax(opts);
    };

    commentModel.prototype.removeComment = function(opts){
        opts.url = "/api/comments_api/comment_remove";
        opts.data = {};
        opts.data.id = opts.comment ? opts.comment.p_Id : opts.id;
        opts.type = "DELETE";
        this.ajax(opts);
    }

    $dc.add(name,commentModel);
})(name);