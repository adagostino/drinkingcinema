var name = "directive.uploadThumbnail";
(function(name){

    var uploadThumbnail = function(opts){};

    uploadThumbnail.prototype.init = function(){
        this.initPreview();
    };

    uploadThumbnail.prototype.initPreview = function(){
        var $scope = this,
            initJcrop = false,
            imageDim = {
                width: 0,
                height: 0
            };
        var opts = {
            'template': "#dc-directive-preview-thumbnail-modal-template",
            'preview': {
                width: 0,
                height: 0,
                left: 0,
                right: 0,
                w: 0
            },
            'parentScope': $scope,
            'afterShow': function () {
                if (!initJcrop) {
                    var $img = this.$el.find('.dc-directive-upload-thumbnail-image');
                    imageDim.width = $img.width();
                    imageDim.height = $img.height();
                    $img.Jcrop({
                        onChange: this.setPreview.bind(this),
                        onSelect: this.setPreview.bind(this),
                        onRelease: this.setPreview.bind(this),
                        aspectRatio: 1
                    });
                    initJcrop = true;
                }
            },
            'setPreview': function (coords) {
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
            }
        };

        var previewModal = $dc.subClass(opts,$dc.directive.modal);
        this.previewModal = new previewModal().initManual();

        this.$watch('image', function(n,o){
            // the problems of using a jquery plugin
            this.previewModal.$el.find(".jcrop-holder img").attr("src", n);;
        });
    };

    uploadThumbnail.prototype.showPreview = function(){
        this.previewModal.show();
    };

    uploadThumbnail.prototype.hidePreview = function(){
        this.previewModal.hide();
    };

    $dc.addDirective({
        name: name,
        directive: uploadThumbnail,
        template: "#dc-directive-upload-thumbnail-template",
        $scope: {
            submit: '&submit',
            thumbnail: 'thumbnail',
            image: 'image'
        }
    });
})(name);