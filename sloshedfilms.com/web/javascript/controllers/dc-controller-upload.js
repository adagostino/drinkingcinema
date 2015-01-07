var name = "controller.upload";
(function(name){
    var upload = new function(){
        var $scope;



        this.init = function(){
            $scope = this;

            this.game = {
                tags: "Party",
                name: "Jam Zone Foreva",
                thumbnail: "http://cdn.drinkingcinema.com/Images/DC_thumbnail.png"
            };

            this.editTagsScope = {
                content: this.game.tags,
                isRTE: true,
                submit: function() {
                    this.processing = true;
                    this.$timeout(function(){
                        this.editing = false;
                        this.processing = false;
                        $scope.game.tags = this.content;
                        console.log($scope.game);
                    }, 1000)
                }
            };

            this.uploadImageScope = {
                submit: function(){
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
                            //console.log("success", data);
                            this.isProcessing = false;
                        },
                        error: function(){
                            alert("error uploading image");
                            $scope.game.image = oldImage;
                        }
                    })

                }
            };

            this.uploadThumbnailScope = {
                image: this.game.image,
                thumbnail: this.game.thumbnail,
                $scope: $scope,
                beforeShow: function(){
                    this.image = $scope.game.image;
                    this.thumbnail = $scope.game.thumbnail;
                },
                submit: function(){
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
                        error: function(xhr, text){
                            console.log("error uploading thumbnail", text, xhr);
                        }
                    });

                }
            };

            this.$watch('game.image', function(n, o){
                //this.uploadThumbnailScope.image = n;
            });

        };
    };
    $dc.extend(name, upload);
})(name);