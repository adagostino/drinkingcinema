var name = "controller.game.desktop.admin";
(function(name){
    var controller = new function(){
        var $scope;

        this.initEditors = function(ce){
            for (var key in ce){
                (function(name, opts){
                    var method = "post" + opts.key.replace(/^./,function(m){ return m.toUpperCase()});
                    $scope[name] = {
                        content: $scope.game[opts.key],
                        isRTE: opts.isRTE,
                        submit: function(){
                            if ($scope.game[opts.key] !== this.content){
                                this.processing = true;
                                var game = {
                                    name: $scope.game.name
                                };
                                game[opts.key] = this.content;
                                $dc.model.game.postGameUpdate({
                                    $scope: this,
                                    game: game,
                                    success: function(data){
                                        console.log("success", data);
                                        this.processing = false;
                                        this.editing = false;
                                        this.content = data[opts.key];
                                        $scope.game[opts.key] = this.content;
                                    },
                                    error: function(err, xhr){
                                        alert(JSON.stringify(err));
                                        this.processing = false;

                                    }
                                });
                            }else {
                                this.editing = false;
                            }
                        }
                    }

                })(key, ce[key]);
            }
        };

        this.init = function(){
            $scope = this;
            this._super();
            this.isAdmin = true;

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


        }
    };

    $dc.extend(name, controller);
})(name);
