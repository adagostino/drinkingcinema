var name = "model.comments.admin";
(function(name){
    var commentModel = function(){};

    commentModel.prototype.postCommentUpdate = function(opts) {
        opts.url = "/api/comment_api/comment_update";
        opts.data = {};
        opts.data.comment = opts.comment;
        this.ajax(opts);
    };

    $dc.add(name,commentModel);
})(name);