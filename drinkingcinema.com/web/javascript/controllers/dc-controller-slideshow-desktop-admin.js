var name = "controller.slideshow.desktop.admin";
(function(name){

    var controller = function(){
        var $scope;

        this.init = function(){
            $scope = this;
            this._super();
            this.imageUploader = new $dc.service.imageUploader({
               $scope: this,
               uploader: 'model.slideshow.postImage'
            });
            this.sortableOptions = {
                'selector': '.dc-slideshow-slide'
            }
            window.$scope = this;
        };

        this.save = function(key) {
            var slideshow = {};
            if (key) {
                slideshow['name'] = this.slideshow['name'];
                slideshow[key] = this.slideshow[key];
            } else {
                for (var key in this.slideshow) {
                    slideshow[key] = this.slideshow[key];
                }
            }
            if (slideshow.hasOwnProperty('slides')) {
                var a = [];
                for (var i=0; i<slideshow.slides.length; i++) {
                    var isProcessing = slideshow.slides[i].isProcessing;
                    var slideJSON = slideshow.slides[i].json();
                    slideJSON.url = isProcessing ? '' : slideJSON.url;
                    a.push(slideJSON);
                }
                slideshow['slides'] = a;
            }

            $dc.model.slideshow.putUpdate({
                $scope: this,
                slideshow: slideshow,
                success: function(data){
                    console.log(data);
                },
                error: function(err, xhr){
                    //alert(JSON.stringify(err));
                    console.log("error");
                }
            });
        };

        this.submit = function(key) {
            if ($scope.slideshow[key] !== this.content){
                this.processing = true;
                var slideshow = {
                    name: $scope.slideshow.name
                };
                slideshow[key] = this.content;
                $dc.model.slideshow.putUpdate({
                    $scope: this,
                    slideshow: slideshow,
                    success: function(data){
                        this.processing = false;
                        this.editing = false;
                        this.content = data[key];
                        $scope.slideshow[key] = this.content;
                    },
                    error: function(err, xhr){
                        //alert(JSON.stringify(err));
                        this.errors = err.errors;
                        this.processing = false;
                    }
                });
            }else {
                this.editing = false;
            }
        };

        this.submitTitle = function(){
            this.$call($scope.submit,"title");
        };

        this.submitDescription = function(){
            this.$call($scope.submit,"description");
        };

        this.uploadCoverImage = function(e) {
            e.stopPropagation();
            e.preventDefault();
            var files = (e.dataTransfer || e.originalEvent.dataTransfer).files;

            this.imageUploader.uploadImage({
                files: files,
                preprocess: function(url) {
                    this.slideshow.img = url;
                },
                loaded: function(url) {
                    this.slideshow.img = url;
                    this.save('img');
                },
                error: function() {

                }
            });
        };

        this.addSlide = function () {

        };

        this.uploadImageSlide = function(image) {
            var slide = new $dc.service.slide('image');
            slide.isLoading = true;
            this.imageUploader.upload({
               file: image,
               preprocess: function(url) {
                   slide.isLoading = false;
                   slide.isProcessing = true;
                   slide.url = url;
               },
               success: function(url) {
                   slide.isProcessing = false;
                   slide.isLoading = false;
               },
               loaded: function(url) {
                   slide.url = url;
                   this.save('slides');
               },
               error: function() {

               }
            });
            this.slideshow.slides.push(slide);
        };

        this.uploadSlides = function(e) {
            e.stopPropagation();
            e.preventDefault();
            var files = (e.dataTransfer || e.originalEvent.dataTransfer).files,
                imageInds = this.imageUploader.getImagesFromFiles(files);
            if (!imageInds.length) return;
            for (var i=0; i<imageInds.length; i++) {
                this.uploadImageSlide(files.item(imageInds[i]));
            }

        };

        this.removeSlide = function(ind) {
            this.slideshow.slides.splice(ind,1);
            this.save('slides');
        };

        this.onSort = function(){
            $scope.save('slides');
        };

    };

    $dc.add(name, controller);
})(name);
