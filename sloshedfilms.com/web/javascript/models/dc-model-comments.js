var name = "model.comments";
(function(name){
    var commentModel = function(){};

    commentModel.prototype.postComment = function(opts){
        opts.url = "/api/comments_api/comment";
        opts.data = {
            'comment': opts.comment,
            'commentHome': opts.commentHome,
            'commentPath': opts.commentPath
        };

        this.ajax(opts);
    };

    commentModel.prototype.get = function(opts){
        opts.url = "/api/comments_api/comments";
        opts.type = "GET";
        opts.data = {
            'commentHome': opts.commentHome,
            'lastComment': opts.lastComment,
            'increment': opts.increment
        };
        this.ajax(opts);
    };

    commentModel.prototype.sendEmail = function(opts){
        opts = opts || {};
        opts.url = "/api/comments_api/send_comment_email";
        opts.type = "POST";
        this.ajax(opts);
    };

    $dc.add(name,commentModel);
})(name);