var name = "directive.uploadImage";
(function(name){

    var uploadImage = function(){};

    uploadImage.prototype.init = function(){
        this.$input = this.$el.find("input");
        this.initPreview();
    };

    uploadImage.prototype.initPreview = function(){
        var self = this;
        var opts = {
            'template': "#dc-directive-preview-image-modal-template",
            'searchItemTemplate': "#dc-subtemplate-search-item-template",
            'numComments': 0,
            'isProcessing': false,
            'uploadProgress': 0,
            'parentScope': this,
            'item': {
                'image': undefined
            },
            'expand': function(){
                this.isExpanded = !!!this.isExpanded;
            },
            'beforeShow': function(){
                self.previewModal.item.image = self.previewImage;
                this.errors = undefined;
            },
            'afterHide': function(){
                self.$input.val("");
                this.image = undefined;
                this.isExpanded = false;
                this.uploadProgress = 0;
            }
        };

        this.previewModal = $dc.service.modal(opts);
        // disable all anchors from the search item template
        this.previewModal.$el.find("a").click(function(e){e.preventDefault()});
    };

    uploadImage.prototype.showPreview = function(){
        this.previewModal.show();
    };

    uploadImage.prototype.cancelPreview = function(){
        this.previewModal.hide();
    }

    uploadImage.prototype.openPicker = function(e) {
        this.$input.trigger("click");
    };

    uploadImage.prototype.onFileChange = function(url) {
        this.previewImage = url;
        this.showPreview();
    };

    uploadImage.prototype.onChange = function(e) {
        var file = e.target.files[0];
        this.file = file;
        var reader = new FileReader();
        var self = this;
        reader.onloadend = function() {
            var url = reader.result;
            self.$call(self.onFileChange, url);
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };

    $dc.addDirective({
        name: name,
        directive: uploadImage,
        template: "#dc-directive-upload-image-template",
        $scope: {
            submit: "&submit"
        }
    });

})(name);