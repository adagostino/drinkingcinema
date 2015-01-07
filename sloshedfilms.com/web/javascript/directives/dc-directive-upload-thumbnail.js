var name = "directive.uploadThumbnail";
(function(name){

    var defaults = {
        'submit': function(){

        }
    }

    var uploadThumbnail = function(opts){
        var $scope;

        var _initPreview = function(){
            var initJcrop = false,
                imageDim = {
                    width: 0,
                    height: 0
                };
            $scope.previewModal =  $dc.directive.modal.init({
                'template': "#dc-directive-preview-thumbnail-modal-template",
                'image': $scope.image,
                'thumbnail': $scope.thumbnail,
                'preview': {
                    width: 0,
                    height: 0,
                    left: 0,
                    right: 0,
                    w: 0
                },
                'beforeShow': function() {
                    typeof $scope.beforeShow === "function" && $scope.beforeShow();
                },
                'afterShow': function(){
                    if (!initJcrop) {
                        imageDim.width = $img.width();
                        imageDim.height = $img.height();
                        $img.Jcrop({
                            onChange: setPreview,
                            onSelect: setPreview,
                            onRelease: setPreview,
                            aspectRatio: 1
                        });
                    }
                },
                'setPreview': function(coords) {
                    if (!coords || !coords.w) return;
                    var rx = 60 / coords.w;
                    var ry = 60 / coords.h;
                    this.preview.width = Math.round(rx * imageDim.width);
                    this.preview.height = Math.round(ry * imageDim.height);
                    this.preview.left = -Math.round(rx * coords.x);
                    this.preview.top = -Math.round(ry * coords.y);
                    this.preview.coords = {
                        x: coords.x,
                        y: coords.y,
                        w: coords.w,
                        h: coords.h,
                        ow: imageDim.width,
                        oh: imageDim.height
                    };
                },
                'afterHide': function(){

                },
                'submit': function(){
                    typeof $scope.submit === "function" && $scope.submit();
                }
            });
            //TODO: Create an "isolate" flag to determine if scope is isolate or should be extended
            // by default all custom directives are isolate, which results in this sort of behavior.
            var $img = $scope.previewModal.$el.find('.dc-directive-upload-thumbnail-image');
            var setPreview = function(coords){
                $scope.previewModal.call($scope.previewModal.setPreview, coords);

            };

            $scope.$watch('isProcessing', function(n, o){
                this.previewModal.isProcessing = n;
            });

            $scope.$watch('image', function(n, o){
                this.previewModal.image = n;
                // the problems of using a jquery plugin
                $(".jcrop-holder img").attr("src", n);
            });
            $scope.$watch('thumbnail', function(n, o){
                this.previewModal.thumbnail = n;
            });

        };

        this.showPreview = function(){
            this.previewModal.show();
        };

        this.hidePreview = function(){
            this.previewModal.hide();
        };

        this.init = function(){
            $scope = this;
            _initPreview();

        };
    };

    $dc.directive.add(name, {
        'directive': uploadThumbnail,
        'template': "#dc-directive-upload-thumbnail-template",
        'defaults': defaults
    })
})(name);