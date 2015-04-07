var name = "directive.lightbox";
(function(name){
    var _imageMap = {};

    var lightbox = function(){};

    var aReg = new RegExp($dc.globals.cdn + "uli","i");

    lightbox.prototype.init = function(){
        var self = this;
        if (!this.$el) this.$el = $("body");
        this.initModal();
        this.page = $dc.utils.getJSON('pageJSON','dc-page-json');
        this.isMobileChrome = this.page.isMobileChrome;
        this.transformObject = new $dc.service.transformObject();

        this.$el.on("click", "img", function(e){
            self.$call(self.click, e);
        });
    };

    lightbox.prototype.initModal = function() {
        var self = this;
        var opts = {
            'modalTemplate': "#dc-lightbox-modal-template",
            'parentScope': this,
            'addClassToBody': false,
            'afterShow': function(){
                if (self.image.loaded) {
                    self.image.show = true;
                    self.slideImage();
                }
            },
            'beforeHide': function(){
                self.image.show = false;
                self.slideImage(self.image.initialParams);
            }
        };

        this.modal = $dc.service.modal(opts);
    };

    lightbox.prototype.showModal = function() {
        this.modalTop = $(window).scrollTop();
        this.modal.show();
    };

    lightbox.prototype.hideModal = function() {
        this.modal.hide();
    };

    // Events:
    lightbox.prototype.click = function(e){
        if (this.modal.open) return;
        var $el = $(e.target),
            href,
            preventDefault = false;
        if ($el.is("a")) {
            href = $el.attr("href");
            preventDefault = aReg.test(href);
            if (!preventDefault) return;
        } else if ($el.is("img")) {
            href = $el.attr("src");
        } else {
            var matches = $el.css("background-image").match(/url\(([^\)]+)\)/);
            href = matches ? matches[1] : "";
        }

        preventDefault && e.preventDefault();
        this.setImage($el, href);


    };

    lightbox.prototype.setImage = function($el, href) {
        if (!href) return;
        this.delegate = $el;
        this.delegateLink = href;

        var image = this.getImage(this.delegateLink, function(image){
            this.sizeImage(image);
            this.showModal();
        });

        if (image.loaded || (!image.loaded && this.delegate.is("a"))){
            image.loaded && this.sizeImage(image);
            this.showModal();
        }

    };

    lightbox.prototype.getImage = function(href, callback) {
        var image = _imageMap[href],
            self = this;
        if (!image) {
            var img = new Image();
            // use jquery just so i don't have to worry about older browsers (even though I probably shouldn't worry
            // at all
            $(img).one("load",function(e){
                _imageMap[href] = {
                    naturalWidth: e.target.naturalWidth,
                    naturalHeight: e.target.naturalHeight,
                    href: href,
                    loaded: true
                };
                self.$call(callback, _imageMap[href]);
            });
            img.src = href;
        }
        var isAnchor = this.delegate.is("a");

        return image || {
                naturalWidth: isAnchor ? 16 : this.delegate.width(),
                naturalHeight: isAnchor ? 16 : this.delegate.height(),
                marginLeft: isAnchor ? -8 : -this.delegate.width()/2,
                marginTop: isAnchor ? -8 : -this.delegate.height()/2,
                href: href,
                loaded: false
            };
    };

    lightbox.prototype.sizeImage = function(image){
        if (this.delegateLink === image.href) {
            this.image = image;
            this.createImage();
            var ww = $(window).width(),
                wh = $(window).height(),
                maxW = ww - 20,
                maxH = wh - 55,
                w = this.image.naturalWidth,
                h = this.image.naturalHeight;
            if (w > maxW) {
                w = maxW;
                h = w* image.naturalHeight/image.naturalWidth;
            }
            if (h > maxH) {
                h = maxH;
                w = h * (image.naturalWidth/image.naturalHeight);
            }
            this.image.width = w;
            this.image.height = h;
            this.image.marginLeft = -w/2;
            this.image.top = $(window).scrollTop() + wh/2 - h/2;
            if (this.delegate.is("a")) return;
            this.transformObject.setReferenceTransformFromElement(this.delegate);

            var imageTop = this.image.top,
                imageLeft = ww/2 + this.image.marginLeft,
                delegateTop  =this.delegate.offset().top,
                delegateLeft = this.delegate.offset().left,
                scale = this.delegate.width() / image.width,
                imageLeftScale = ww/2 + this.image.marginLeft*scale,
                imageTopScale = this.image.top - (this.image.height/2)*scale;

            var params = {
                translateY: delegateTop - imageTop - (this.image.height - this.image.height*scale)/2,
                translateX: (delegateLeft - imageLeftScale),
                scaleX: scale,
                scaleY: scale
            };

            this.transformObject.setTransitionTimeOnElement(this.image.$el, "0s");
            this.transformObject.setTransformOnElementFromParams(this.image.$el, params);
            this.image.initialParams = params;

        }
    };

    lightbox.prototype.sizeImage2 = function(image) {
        if (this.delegateLink === image.href) {
            this.image = image;
            var w = image.naturalWidth, h = image.naturalHeight;
            var ww = $(window).width(),
                wh = $(window).height();
            var maxW = ww - 20,
                maxH = wh - 55;

            if (w > maxW) {
                w = maxW;
                h = w* image.naturalHeight/image.naturalWidth;
            }
            if (h > maxH) {
                h = maxH;
                w = h * (image.naturalWidth/image.naturalHeight);
            }
            this.image.width = w;
            this.image.height = h;
            this.image.marginLeft = -w/2;
            this.image.marginTop = -h/2;

            //this.delegate;
            this.transformObject.setReferenceTransformFromElement(this.delegate);
            if (this.delegate.is("a")) return;

            var imageTop = wh/2 + this.image.marginTop,
                imageLeft = ww/2 + this.image.marginLeft,
                delegateTop = this.delegate.offset().top - $(window).scrollTop(),
                delegateLeft = this.delegate.offset().left,
                scale = this.delegate.width() / image.width,
                imageLeftScale = ww/2 + this.image.marginLeft*scale,
                imageTopScale = wh/2 + this.image.marginTop*scale;

            //alert(delegateTop + "," + this.delegate[0].getBoundingClientRect().top + "," + this.delegate[0].clientTop);
            //alert($(window).scrollTop() + "," + window.scrollY + "," + window.innerHeight + "," + window.outerHeight + "," + window.height);
            var params = {
                translateY: Math.round((delegateTop - imageTopScale)),
                translateX: (delegateLeft - imageLeftScale),
                scaleX: scale,
                scaleY: scale
            };


            if (!this.modalImg) this.modalImg = this.modal.$el.find("img");

            this.transformObject.setTransitionTimeOnElement(this.modalImg, "0s");
            this.transformObject.setTransformOnElementFromParams(this.modalImg, params);


        }
    };

    lightbox.prototype.slideImage = function(params){
        this.transformObject.setTransitionTimeOnElement(this.image.$el, "0.6s");
        this.transformObject.setTransformOnElementFromParams(this.image.$el, params || {
            translateY: 0,
            translateX: 0,
            scaleX: 1,
            scaleY: 1
        });
    };



    lightbox.prototype.createImage = function(){
        if (!this.image || this.image.$el) return;
        if (!this.imgTemplate) {
            var imgTemplate = '<img class="dc-lightbox-img" src="{{href}}" dc-style="{';
            imgTemplate+="'margin-left': marginLeft, 'top': top, 'width': width, 'height': height}";
            imgTemplate+='" ';
            imgTemplate+='dc-class="{';
            imgTemplate+="'show': show}";
            imgTemplate+='">';
            this.imgTemplate = $dc.viewParser.parse(imgTemplate);
        }
        var $el =  this.imgTemplate.getElement(this.image);
        $("body").append($el);
        this.image.$el = $el;
    }


    $dc.addDirective({
        name: name,
        directive: lightbox,
        $scope: {}
    });
})(name);
