var name = "directive.uploadImage";
(function(name){

    var defaults = {
        'openPicker': function(e) {
            this.$input.trigger("click");
        },
        'onFileChange': function(url) {
            this.previewImage = url;
            this.showPreview();
            //this.$timeout(function(){ this.showPreview();}, 2000);
        },
        'cancelPreview': function(){
            this.cancelPreview();
        },
        'onChange': function(e) {
            var file = e.target.files[0];
            this.file = file;
            var reader = new FileReader();
            var self = this;
            reader.onloadend = function() {
                var url = reader.result;
                self.call(self.onFileChange, url);
            };
            if (file) {
                reader.readAsDataURL(file);
            }
        },
        'submit': function(){

        }
    };

    var uploadImage = function(opts){
        var $scope;

        var _initPreview = function(){

            $scope.previewModal = $dc.directive.modal.init({
                'template': "#dc-directive-preview-image-modal-template",
                'searchItemTemplate': "#dc-subtemplate-search-item-template",
                'numComments': 0,
                expand: function(){
                    this.isExpanded = !!!this.isExpanded;
                },
                beforeShow: function(){
                    $scope.previewModal.image = $scope.previewImage;
                },
                submit: function(fn){
                    this.hide();
                },
                afterHide: function(){
                    $scope.$input.val("");
                    this.image = undefined;
                    this.isExpanded = false;
                },
                onLoad: function(){
                    this.show();
                }
            });
            $scope.previewModal.$el.find("a").click(function(e){e.preventDefault()});
        };

        this.showPreview = function(){
            $scope.previewModal.show();
        };

        this.cancelPreview = function(){
            $scope.previewModel.hide();
        }

        this.init = function(){
            $scope = this;
            this.$input = this.$el.find("input");
            _initPreview();
        };
    };

    $dc.directive.add(name, {
        'directive': uploadImage,
        'template': "#dc-directive-upload-image-template",
        'defaults': defaults
    });

})(name);