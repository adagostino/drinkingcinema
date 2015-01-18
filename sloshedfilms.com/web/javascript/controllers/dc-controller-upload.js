var name = "controller.upload";
(function(name){
    var upload = new function(){
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

        this.initEditors = function(ce){
            for (var key in ce){
                (function(name, opts){

                    $scope[name] = {
                        content: $scope.game[opts.key],
                        isRTE: opts.isRTE,
                        submit: function(){
                            this.editing = false;
                            $scope.game[opts.key] = this.content;
                        }
                    }

                })(key, ce[key]);
            }
        };

        this.init = function(){
            $scope = this;
            this.cdn = $dc.globals.cdn;
            this.isAdmin = true;
            this.game = $dc.model.game.getGameJSON();

            var ce = {
                "editTagsScope": {
                    key: "tags",
                    isRTE: false
                },
                "editRulesScope": {
                    "key": "rules",
                    isRTE: true
                },
                "editOptionalRulesScope": {
                    "key": "optionalRules",
                    isRTE: true
                }
            };

            this.initGameName();

            this.initEditors(ce);

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
                            console.log("success", data);
                            this.isProcessing = false;
                        },
                        error: function(err, xhr){
                            alert("problem uploading image -- check console");
                            console.log("error uploading image", err, xhr);
                            $scope.game.image = oldImage;
                        }
                    })

                }
            };

            this.uploadThumbnailScope = {
                image: this.game.image,
                thumbnail: this.game.thumbnail,
                $scope: $scope,
                ready: function(){
                    // this is here until i take time to two way bind strings sent to the controller
                    $scope.uploadThumbnailScope = this;
                },
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
                        error: function(err, xhr){
                            this.isProcessing = false;
                            alert("problem uploading thumbnail -- check console");
                            console.log("error uploading thumbnail", err, xhr);
                        }
                    });

                }
            };

            this.uploadModal = $dc.directive.modal.init({
                template: "#dc-upload-game-modal-template",
                isProcessing: false,
                parentScope: this,
                beforeShow: function() {
                    this.errors = undefined;
                },
                submit: function(){
                    this.isProcessing = true;
                    $dc.model.game.postGame({
                        game: $scope.game,
                        $scope: this,
                        success: function(response){
                            this.isProcessing = false;
                            console.log("success", response);
                        },
                        error: function(err, xhr){
                            console.log(this);
                            this.errors = err.errors;
                            this.isProcessing = false;
                        }
                    })
                }
            });


            this.$watch('game.name', function(n, o){
                var name = n ? this.cdn + "Games/" + $dc.model.game.toUrl(n) : "";
                this.game.image =  name ? name + "_large.jpg" : "";
                this.game.thumbnail = name ? name + "_thumb.jpg" : "";
                this.uploadThumbnailScope.thumbnail = this.game.thumbnail || defaultThumb;
            });

        };
    };
    $dc.extend(name, upload);
})(name);