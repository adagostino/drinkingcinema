var name = "directive.gameImage.admin";
(function(name){
    var gameImage = function(){
        var $scope;

        this.submitImage = function(){
            this.isProcessing = true;
            var modalScope = this.previewModal;
            var oldImage = $scope.game.image;
            this.parentScope.game.image = this.previewImage;

            $dc.model.game.postImage({
                $scope: this,
                name: $scope.game.name,
                file: this.file,
                progress: function(e, percent){
                    modalScope.uploadProgress = percent;
                    if (percent >= 100) {
                        this.$timeout(function(){
                            !modalScope.errors && modalScope.hide();
                        },100);
                    }
                },
                success: function(data){
                    modalScope.errors = undefined;
                    this.isProcessing = false;
                },
                error: function(err, xhr){
                    modalScope.errors = err.errors;
                    $scope.game.image = oldImage;
                    this.isProcessing = false;
                }
            });
        };

        this.submitThumbnail = function(){
            this.isProcessing = true;
            var modalScope = this.previewModal;

            $dc.model.game.postThumbnail({
                name: $scope.game.name,
                coords: modalScope.preview.coords,
                $scope: this,
                success: function(response){
                    this.isProcessing = false;
                    this.thumbnail = response.thumbnail + "?cacheBuster=" + new Date().getTime();
                    $scope.game.thumbnail = this.thumbnail;
                    modalScope.hide();
                },
                error: function(err, xhr){
                    modalScope.errors = err.errors;
                    this.isProcessing = false;
                    //alert("problem uploading thumbnail -- check console");
                    console.log("error uploading thumbnail", err, xhr);
                }
            });
        };

        this.init = function(){
            this.isAdmin = true;
            this._super();
            $scope = this;
        };
    };


    $dc.addDirective({
        name: name,
        directive: gameImage,
        template: "#dc-directive-game-image-template",
        $scope: {
            'game': '=game'
        }
    })
})(name);