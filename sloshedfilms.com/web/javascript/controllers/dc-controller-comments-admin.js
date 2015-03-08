var name = "controller.comments.admin";
(function(name){


    var controller = function(){
        var $scope;

        this.editComment = function(){
            $scope.currentComment = this;
            $scope.editModal.comment = $.extend(true,{},this.comment);
            $scope.editModal.comment.comment = $scope.scrub($scope.editModal.comment.comment);
            $scope.editModal.show();
        };
        
        this.removeComment = function(){
            $scope.currentComment = this;
            $scope.removeModal.comment = $.extend(true,{},this.comment);
            $scope.removeModal.show();
        };


        this.init = function(){
            this.isAdmin = true;
            this._super();
            $scope = this;
            this.initEditModal();
            this.initRemoveModal();
        }
    };

    controller.prototype.scrub = function(html){
        if (!this.$pre) this.$pre = $("<pre>");
        this.$pre.html(html);
        this.$pre.find("iframe").replaceWith(function(){return this.src});
        this.$pre.find("img").replaceWith(function(){return this.src});
        this.$pre.find("a").replaceWith(function(){ return this.href});
        return this.$pre.text();
    };

    controller.prototype.initEditModal = function(){
        var self = this;
        var opts = {
            'template': "#dc-comment-form-template",
            'isProcessing': false,
            'parentScope': this,
            'comment': {},
            'onValidate': function(){
                console.log("on validate");
            },
            'submitComment': function(){
                this.isProcessing = true;
                $dc.model.comments.admin.postCommentUpdate({
                    "comment": this.comment,
                    "$scope": this,
                    success: function(comment){
                        $.extend(self.currentComment.comment, comment);
                        this.isProcessing = false;
                        this.hide();
                    },
                    error: function(){
                        console.log("error", arguments);
                    }
                });
            }
        };

        this.editModal = $dc.service.modal(opts);
    };

    controller.prototype.initRemoveModal = function(){
        var self = this;
        var opts = {
            'template': "#dc-remove-comment-modal-template",
            'isProcessing': false,
            'parentScope': this,
            'comment': {},
            'beforeShow': function(){
                this.errors = undefined;
            },
            'submit': function(){
                this.isProcessing = true;
                $dc.model.comments.admin.removeComment({
                    'comment': this.comment,
                    '$scope': this,
                    'success': function(){
                        self.removeCommentById(this.comment.p_Id);
                        this.isProcessing = false;
                        this.hide();
                    },
                    'error': function(err, xhr){
                        this.errors = err.errors;
                        this.isProcessing = false;
                    }
                });
            }
        };

        this.removeModal = $dc.service.modal(opts);
    };

    controller.prototype.removeCommentById = function(id){
        for (var i=0; i<this.commentSource.items.length; i++){
            var comment = this.commentSource.items[i];
            if (comment.p_Id === id) {
                this.commentSource.items.splice(i,1);
                break;
            }
        }
    }

    $dc.add(name,controller);
})(name);