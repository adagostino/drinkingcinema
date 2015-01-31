var name = "controller.upload";
(function(name){
    var upload = function(){
        var $scope;

        this.initGameName = function(){
            // a little bad structure here b/c the input for the name lives outside this controller
            var $el = $(".dc-share-input input");
            // add the model and the input listener
            $el.attr({
                "dc-model": "game.name"
            });
            $dc.watchElement($el, this, null, true);

        };

        this.submit = function(key){
            this.editing = false;
            $scope.game[key] = this.content;
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

        this.initUploadModal = function(){
            var opts = {
                template: "#dc-upload-game-modal-template",
                isProcessing: false,
                parentScope: this,
                beforeShow: function(){
                    this.errors = undefined
                },
                submit: function(){
                    this.isProcessing = true;
                    $dc.model.game.postGame({
                        game: $scope.game,
                        $scope: this,
                        success: function(game){
                            this.isProcessing = false;
                            // redirect to the game page
                            window.location.replace("/game/"+game.nameUrl);
                        },
                        error: function(err, xhr){
                            console.log(this);
                            this.errors = err.errors;
                            this.isProcessing = false;
                        }
                    });
                }
            };
            this.uploadModal = new $dc.service.modal(opts);
        };

        this.init = function(){
            $scope = this;
            this.cdn = $dc.globals.cdn;
            this.isAdmin = true;
            this.game = $dc.utils.getJSON('gameJSON','dc-game-json');
            var defaultThumb = this.game.thumbnail;


            this.initGameName();
            this.initUploadModal();

            this.$watch('game.name', function(n, o){
                var name = n ? this.cdn + "Games/" + $dc.utils.toUrl(n) : "";
                this.game.image =  name ? name + "_large.jpg" : "";
                this.game.thumbnail = name ? name + "_thumb.jpg" : defaultThumb;
            });

        };
    };
    $dc.add(name, upload);
})(name);