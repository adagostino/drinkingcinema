var name = "controller.game.desktop.admin";
(function(name){
    var controller = function(){
        var $scope;

        this.submit = function(key){
            if ($scope.game[key] !== this.content){
                this.processing = true;
                var game = {
                    name: $scope.game.name
                };
                game[key] = this.content;
                $dc.model.game.postGameUpdate({
                    $scope: this,
                    game: game,
                    success: function(data){
                        console.log("success", data);
                        this.processing = false;
                        this.editing = false;
                        this.content = data[key];
                        $scope.game[key] = this.content;
                    },
                    error: function(err, xhr){
                        alert(JSON.stringify(err));
                        this.processing = false;

                    }
                });
            }else {
                this.editing = false;
            }
        };

        this.submitTags = function(){
            this.$call($scope.submit,"tags");
        };

        this.submitRules = function(){
            this.$call($scope.submit,"rules");
        };

        this.submitOptionalRules = function(){
            this.$call($scope.submit,"optionalRules");
        };

        this.submitImage = function(){
            this.isProcessing = true;
            var modalScope = this.previewModal;
            var oldImage = $scope.game.image;
            $scope.game.image = this.previewImage;
            $dc.model.game.postImage({
                $scope: this,
                name: $scope.game.name,
                file: this.file,
                progress: function(e, percent){
                    modalScope.uploadProgress = percent;
                    if (percent >= 100) {
                        modalScope.hide();
                    }
                },
                success: function(data){
                    console.log("success", data);
                    this.isProcessing = false;
                },
                error: function(err, xhr){
                    alert("problem uploading image -- check console");
                    console.log("error uploading image", err, xhr);
                    $scope.game.image = oldImage;
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
                    this.isProcessing = false;
                    alert("problem uploading thumbnail -- check console");
                    console.log("error uploading thumbnail", err, xhr);
                }
            });
        };

        this.init = function(){
            this._super();
            this.isAdmin = true;
            $scope = this;
        }
    };

    $dc.add(name, controller);
})(name);