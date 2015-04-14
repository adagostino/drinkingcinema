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
        this.transitionObject = new $dc.service.transitionObject();

        this.$el.on("click", "a, img", function(e){
            self.$call(self.click, e);
        });
        $(window).on("orientationchange scroll", function(){
            //self.hideModal();
        });

    };

    lightbox.prototype.initModal = function() {
        var self = this;
        var opts = {
            'modalTemplate': "#dc-lightbox-modal-template",
            'parentScope': this,
            'addClassToBody': false,
            'beforeShow': function() {
                /*
                try{
                    self.transitionObject.removeTransitionFromElement(self.image.$el);
                    self.transitionObject.removeTransitionFromElement(self.image.$img);
                } catch (e) {

                };
                */

            },
            'afterShow': function() {
                if (self.image.loaded) {
                    self.image.show = true;
                    self.transitionObject.removeTransitionFromElement(self.image.$el);
                    self.transitionObject.removeTransitionFromElement(self.image.$img);
                    this.$timeout(function(){self.slideImage()});
                }
            },
            'beforeHide': function() {
                try {
                    self.image.show = false;
                    self.image.zoomed = false;
                    self.transitionObject.removeTransitionFromElement(self.image.$el);
                    self.transitionObject.removeTransitionFromElement(self.image.$img);
                    this.$timeout(function(){self.slideImage(self.image.initialParams)});
                } catch (e) {

                }
            }
        };

        this.modal = $dc.service.modal(opts);
        /*
        this.modal.$el.each(function(){
            var h = new Hammer(this);
            h.get('pan').set({ direction: Hammer.DIRECTION_ALL });
            h.on("pan panstart panend",function(e){self.$call(self.handleDrag, e)});
        });
        */
    };

    lightbox.prototype.showModal = function() {
        this.scrollTop = $(window).scrollTop();
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
        // reset the image
        this.image = {};
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
            self = this,
            isAnchor = this.delegate.is("a");
        if (!image) {
            var img = new Image();
            // use jquery just so i don't have to worry about older browsers (even though I probably shouldn't worry
            // at all
            $(img).one("load",function(e){
                _imageMap[href] = {
                    naturalWidth: e.target.naturalWidth,
                    naturalHeight: e.target.naturalHeight,
                    href: href,
                    isAnchor: isAnchor,
                    loaded: true
                };
                self.$call(callback, _imageMap[href]);
            });
            img.src = href;
        }

        return image || {
                naturalWidth: isAnchor ? 40 : this.delegate.width(),
                naturalHeight: isAnchor ? 40 : this.delegate.height(),
                marginLeft: isAnchor ? -20 : -this.delegate.width()/2,
                marginTop: isAnchor ? -20 : -this.delegate.height()/2,
                href: href,
                loaded: false
            };
    };

    lightbox.prototype.sizeImage = function(image){
        if (this.delegateLink === image.href) {
            this.image = image;
            this.createImage();
            var ww = window.innerWidth,
                wh = window.innerHeight,
                sT = $(window).scrollTop(),
                maxW = ww,
                maxH = wh - 45,
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
            this.image.width = ww;
            this.image.imageWidth = w;
            this.image.height = maxH;
            this.image.imageHeight = h;
            this.image.marginLeft = -ww/2;
            this.image.imageMarginLeft = -w/2;
            this.image.top = sT + 45;
            var calcImageTop = (this.image.height - this.image.imageHeight - 45) / 2.0;
            this.image.imageTop = calcImageTop < 0 ? 0 : calcImageTop;


            this.image.center = {
                x: ww / 2,
                y: wh / 2 - (calcImageTop < 0 ? calcImageTop : 0) // - (this.image.height - this.image.imageHeight - 45)/2
            };

            if (this.delegate.is("a")) return;
            this.transformObject.setReferenceTransformFromElement(this.delegate);

            var imageTop = this.image.top,
                delegateTop  =this.delegate.offset().top,
                delegateLeft = this.delegate.offset().left,
                scale = this.delegate.width() / image.imageWidth,
                imageLeftScale = ww/2 + this.image.imageMarginLeft*scale;

            var params = {
                translateY: delegateTop - imageTop - (this.image.height - this.image.height*scale)/2 - this.image.imageTop*scale,
                translateX: (delegateLeft - imageLeftScale),
                scaleX: scale,
                scaleY: scale
            };

            this.transitionObject.setDurationOnElement(this.image.$el, "0s");
            this.transformObject.setTransformOnElementFromParams(this.image.$el, params);
            this.image.initialParams = params;

        } else {
            this.hideModal();
        }
    };

    lightbox.prototype.slideImage = function(params){
        this.transitionObject.setDurationOnElement(this.image.$el, "0.6s");
        this.image.isAnchor ? this.transformObject.removeTransformOnElement(this.image.$el) :
        this.transformObject.setTransformOnElementFromParams(this.image.$el, params || {
            translateY: 0,
            translateX: 0,
            scaleX: 1,
            scaleY: 1
        });
        this.transitionObject.setDurationOnElement(this.image.$img, "0.6s");
        this.transformObject.setTransformOnElementFromParams(this.image.$img, {
            translateY: 0,
            translateX: 0,
            scaleX: 1,
            scaleY: 1
        });

        //alert(JSON.stringify(new $dc.service.transitionObject(this.image.$el).transitions));
    };

    lightbox.prototype.toggleZoom = function(e){
        if (!this.modal.open) return;
        if (!this.image.zoomed) {
            this.transformObject.setZoomOnElement(this.image.$img, e.center.x, e.center.y, 3, this.image.center.x, this.image.center.y);
            this.image.zoomed = true;
        } else {
            this.transformObject.setTransformOnElementFromParams(this.image.$img, {
                translateY: 0,
                translateX: 0,
                scaleX: 1,
                scaleY: 1
            });
            this.image.zoomed = false;
        }
    };

    var _getZoomParams = function(startXY, currXY, startParams, image){

        var zoomParams =  {
            translateX: currXY.x - startXY.x + startParams.translateX,
            translateY: currXY.y - startXY.y + startParams.translateY,
            scaleX: startParams.scaleX,
            scaleY: startParams.scaleY
        };
        return _onEdge(image, zoomParams);
    };

    var _onEdge = function(image, params){
        var w = image.width,
            h = image.imageHeight,
            left = params.translateX - w*(params.scaleX - 1)/ 2,
            top = params.translateY - h*(params.scaleY - 1)/ 2,
            onHorizontalEdge = false,
            onVerticalEdge = false;
        var newLeft = params.translateX;
        //console.log(left, -w*(scale.x - 1)/2);
        if (left >=0){
            newLeft = w*(params.scaleX - 1) /2;
            onHorizontalEdge = true;
        }else if (left <= -w*(params.scaleX -1)){
            newLeft = -w*(params.scaleX - 1) /2;
            onHorizontalEdge = true;
        }

        var newTop = params.translateY;
        if (top >=0){
            newTop = h*(params.scaleY - 1) /2;
            onVerticalEdge = true;
        }else if (top <= -h*(params.scaleY - 1)){
            newTop = -h*(params.scaleY - 1) / 2;
            onVerticalEdge = true;
        }

        params.onHorizontalEdge = onHorizontalEdge;
        params.onVerticalEdge = onVerticalEdge;
        params.edgeParams = {
            translateX: newLeft,
            translateY: newTop,
            scaleX: params.scaleX,
            scaleY: params.scaleY
        }

        return params;
    }

    var _startParams, _startXY, _startTop, _scrollTop;

    lightbox.prototype.handleDrag = function(e) {
        if (!this.modal.open) return;
        switch(e.type) {
            case "panstart":
                if (this.image.zoomed) {
                    this.transformObject.setReferenceTransformFromElement(this.image.$img);
                    this.transformObject.setTransitionTimeOnElement(this.image.$img, "0s");
                    _startParams = this.transformObject.getReferenceParams();
                    _startXY = e.center;
                    _startTop = this.image.top;
                    _scrollTop = $(window).scrollTop();
                }
                break;
            case "pan":
                if (!this.image.zoomed) {
                    Math.abs(e.deltaY) > 10 && this.hideModal();
                    return;
                }
                this.transformObject.setTransformOnElementFromParams(this.image.$img, _getZoomParams(_startXY, e.center, _startParams, this.image));
                //this.image.top = _startTop + ($(window).scrollTop() - _scrollTop);
                break;
            case "pancancel":
            case "panend":
                var zoomParams = _getZoomParams(_startXY, e.center, _startParams, this.image);
                if (zoomParams.onHorizontalEdge || zoomParams.onVerticalEdge) {
                    this.transformObject.setTransitionTimeOnElement(this.image.$img, "0.6s");
                    this.transformObject.setTransformOnElementFromParams(this.image.$img, zoomParams.edgeParams);
                }
                break;
        }
    };

    lightbox.prototype.createImage = function(){
        if (!this.image || this.image.$el) return;

        var imgTemplate = '<div class="dc-lightbox-img-container" dc-style="{';
        imgTemplate += "'margin-left': marginLeft, 'top': top, 'width': width, 'height': height}";
        imgTemplate += '" ';
        imgTemplate += 'dc-class="{';
        imgTemplate += "'show': show, 'dc-lightbox-img-anchor': isAnchor}";
        imgTemplate += '">';
        imgTemplate += '<img class="dc-lightbox-img" src="{{href}}" dc-style="{';
        imgTemplate += "'top': imageTop, 'width': imageWidth, 'margin-left': imageMarginLeft}";
        imgTemplate += '" ';
        imgTemplate += 'dc-class="{';
        imgTemplate += "'show': show, 'dc-lightbox-img-anchor': isAnchor}";
        imgTemplate += '"></div>';
        var template = $dc.viewParser.parse(imgTemplate);

        var $el =  template.getElement(this.image),
            $img = $el.find("img");
        $("body").append($el);
        this.image.$el = $el;
        this.image.$img = $img;
        var self = this;
        var h = new Hammer($img[0]);
        h.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        h.on("doubletap", function(e) {
            e.preventDefault();
            self.$timeout(function(){self.$call(self.toggleZoom, e);});
        });
        h.on("pan panstart panend pancancel", function(e){
            self.$call(self.handleDrag,e);
        });
    };


    $dc.addDirective({
        name: name,
        directive: lightbox,
        $scope: {}
    });
})(name);
