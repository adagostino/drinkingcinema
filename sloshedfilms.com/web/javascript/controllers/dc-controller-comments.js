var name = "controller.comments";
(function(name){
    var controller = function(){
        var $scope;

        this.postComment = function(){
            $dc.utils.setLocal("commenterName",this.comment.name);
            $dc.utils.setLocal("commenterEmail",this.comment.email);
            $dc.model.comments.postComment({
                "comment": this.comment,
                "commentHome": this.commentHome,
                "$scope": this,
                success: function(comment){
                    console.log(comment);
                    this.commentGetter.prev(function(){
                        $scope.comment.comment = "";
                        $scope.isProcessing = false;
                    });
                },
                error: function(){
                    console.log("error", arguments);
                }
            });
        };

        this.submitComment = function(){
            this.numErrors = 0;
            this.isProcessing = true;
            this.$timeout(function(){
                this.isProcessing = !!!this.numErrors;
                if (!this.numErrors) this.postComment();
            });
        };

        this.onValidate = function(){
            $scope.numErrors+= this.errors.length;
        };

        this.onInputFocusBlur = function(hasFocus){
            $scope.inputHasFocus = hasFocus;
        };

        // assumes weird object that looks like an array but doesn't have a length
        var _obj2array = function(obj){
            var a = [];
            for (var key in obj){
                a[parseInt(key)] = obj[key];
            }
            return a;
        };

        this.init = function(){
            $scope = this;
            this.comments = _obj2array($dc.utils.getJSON('commentsJSON','dc-comments-json'));
            this.numErrors = 0;
            this.comment = {
                name: $dc.utils.getLocal("commenterName"),
                email: $dc.utils.getLocal("commenterEmail"),
                comment: ''
            };
            this.commentHome = window.location.pathname.split('/')[2];

            var self = this;
            this.commentGetter = new $dc.service.getter({
                increment: 10,
                buffer: 50,
                items: this.comments,
                model: $dc.model.comments,
                modelFunc: "get",
                setModelOpts: function(currItem){
                    return {
                        '$scope': $scope,
                        'commentHome': $scope.commentHome,
                        'lastComment': currItem ? currItem.p_Id : ""
                    }
                }
            });

            window.scope = this;
        };

    };

    $dc.add(name, controller);
})(name);
