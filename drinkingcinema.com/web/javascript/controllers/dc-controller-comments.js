var name = "controller.comments";
(function(name){
    var controller = function(){
        var $scope;

        this.putComment = function(){
            $dc.utils.setLocal("commenterName",this.comment.name);
            $dc.utils.setLocal("commenterEmail",this.comment.email);
            $dc.model.comments.putComment({
                "comment": this.comment,
                "commentHome": this.commentHome,
                "commentPath": this.commentPath,
                "$scope": this,
                success: function(comment){
                    this.commentSource.prev(function(){
                        $scope.comment.comment = "";
                        $scope.isProcessing = false;
                    });
                    $dc.model.comments.sendEmail();
                },
                error: function(){
                    //console.log("error", arguments);
                }
            });
        };

        this.submitComment = function(){
            if (this.isProcessing) return;
            this.numErrors = 0;
            this.isProcessing = true;
            this.$timeout(function(){
                this.isProcessing = !!!this.numErrors;
                if (!this.numErrors) this.putComment();
                this.logEvent(this.numErrors ? $dc.ax.action.VALIDATION_ERROR : $dc.ax.action.SUBMIT);
            });
        };

        this.onValidate = function(){
            $scope.numErrors+= this.errors.length;
        };

        this.onInputFocusBlur = function(hasFocus){
            if (!$scope.focusLogged && this.name.toLowerCase() === "comment" && hasFocus) {
                $scope.logEvent($dc.ax.action.FOCUS);
                $scope.focusLogged = true;
            }
            $scope.inputHasFocus = hasFocus;
        };

        this.logEvent = function(action) {
            $dc.ax.event($dc.ax.category.COMMENT, action, this.page.title);
        };


        this.init = function(){
            $scope = this;
            this.page = $dc.utils.getJSON('pageJSON','dc-page-json');
            console.log("comments requested", this.page.numCommentsRequested);
            this.results = this.page.comments;
            this.numErrors = 0;
            this.focusLogged = false;
            this.comment = {
                name: $dc.utils.getLocal("commenterName"),
                email: $dc.utils.getLocal("commenterEmail"),
                comment: ''
            };
            var pathname = window.location.pathname.split('/');
            this.commentPath = pathname[2] ? pathname[1] : "";
            this.commentHome = pathname[2] || pathname[1];


            var self = this;
            this.commentSource = new $dc.service.dataSource({
                'increment': 10,
                'buffer': 50,
                'data': this.results,
                'name': "Comments for " + this.page.title,
                'getter': function(success,error,lastItem, dir){
                    var opts = {
                        'commentHome': $scope.commentHome,
                        'lastComment': lastItem ? lastItem.p_Id : "",
                        'increment': dir * this.buffer,
                        'success': success,
                        'error': error
                    };
                    $dc.model.comments.get(opts);
                    self.replaceHistory = true;
                }
            });
            $(window).on("unload", function(){
                //$scope.$call($scope.onPop);
                $scope.$call($scope.onUnload);
            });
        };

        this.onUnload = function(){
            $dc.ax.event($dc.ax.category.INFINITESCROLL, "Comments for " + this.page.title, this.commentSource.items.length);
        };

        this.onPop = function(){
            if (!this.replaceHistory) return;
            $dc.$location.search({
                'nc': this.commentSource.items.length
            });
        };

    };

    $dc.add(name, controller);
})(name);
