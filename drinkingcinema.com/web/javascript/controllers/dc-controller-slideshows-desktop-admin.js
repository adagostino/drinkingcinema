var name = "controller.slideshows.desktop.admin";
(function(name){
    var controller = function(){
        this.initModal = function(){
            var $scope = this;
            var opts = {
                template: "#dc-add-slideshow-modal-template",
                isProcessing: false,
                parentScope: this,
                beforeShow: function(){
                    this.errors = undefined
                },
                submit: function(){
                    this.isProcessing = true;
                    $dc.model.slideshow.postSlideshow({
                        slideshow: $scope.slideshow,
                        $scope: this,
                        success: function(slideshow){
                            console.log(slideshow);
                            this.isProcessing = false;
                            // redirect to the slideshow page
                            //window.location.replace("/game/"+game.nameUrl);
                        },
                        error: function(err, xhr) {
                            this.errors = err.errors;
                            this.isProcessing = false;
                        }
                    });
                }
            };
            this.slideshowModal = new $dc.service.modal(opts);
        };

        this.init = function(){
            this._super();
            this.slideshow = {
                'name': ''
            }
            this.initModal();
        }
    };

    $dc.add(name, controller);
})(name);
