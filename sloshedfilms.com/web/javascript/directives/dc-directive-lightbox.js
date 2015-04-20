var name = "directive.lightbox";
(function(name){
    var _imageMap = {},
        _aReg = new RegExp($dc.globals.cdn + "uli","i"),
        _animationTime = "0.6s",
        _maxScale = 3,
        _minScale = 1;


    var _animationTimeMS = 0;
    _animationTime.replace(/(\d*\.*\d*)(s|ms)/, function(match,duration,durationUnit){
        _animationTimeMS = durationUnit === "s" ? parseFloat(duration)*1000 : parseFloat(duration)
    });

    var lightbox = function(){};

    lightbox.prototype.init = function(){
        var self = this;
        if (!this.$el) this.$el = $("body");
        this.initModal();
        this.page = $dc.utils.getJSON('pageJSON','dc-page-json');
        this.transformObject = new $dc.service.transformObject();
        this.transitionObject = new $dc.service.transitionObject();

        this.$el.on("click", "a, img", function(e){
            self.$call(self.click, e);
        });

        $(window).on("orientationchange scroll resize", function(){
            self.modal.open && self.hideModal();
        });

    };

    lightbox.prototype.initModal = function() {
        var self = this;
        var opts = {
            'modalTemplate': "#dc-lightbox-modal-template",
            'parentScope': this,
            'addClassToBody': false,
            'beforeShow': function() {
                self.modalShowing = true;
            },
            'afterShow': function() {
                if (self.image.loaded) {
                    self.image.show = true;
                    self.image.showInfo = true;
                    self.transitionObject.removeTransitionFromElement(self.image.$el);
                    self.transitionObject.removeTransitionFromElement(self.image.$img);
                    this.$timeout(function(){self.slideImage()});
                }
            },
            'beforeHide': function() {
                try {
                    self.image.show = false;
                    self.image.showInfo = false;
                    self.image.infoWasHidden = false;
                    self.image.zoomed = false;
                    self.image.pinching = false;
                    self.transitionObject.removeTransitionFromElement(self.image.$el);
                    self.transitionObject.removeTransitionFromElement(self.image.$img);
                    this.$timeout(function(){self.slideImage(self.image.initialParams)});
                    if (self.delegate.is("a")){
                        self.modalShowing = false;
                    } else {
                        this.$timeout(function(){self.modalShowing = false}, _animationTimeMS);
                    }

                } catch (e) {

                }
            }
        };

        this.modal = $dc.service.modal(opts);

        this.modal.$el.each(function(){
            self.$call(self.addCancelPanListener(this));
        });

    };

    lightbox.prototype.showModal = function() {
        this.scrollTop = $(window).scrollTop();
        this.modal.show();
    };

    lightbox.prototype.hideModal = function(e) {
        this.modal.hide();
    };

    lightbox.prototype.toggleImageInfo = function(e) {
        if (this.image.zoomed) return;
        this.image.showInfo = !!!this.image.showInfo;
        this.image.infoWasHidden = true;
    };

    // Events:
    lightbox.prototype.click = function(e){
        if (this.modal.open) return;
        var $el = $(e.target),
            href,
            preventDefault = false;
        if ($el.is(".dc-lightbox-img")) return;

        if ($el.is("a")) {
            href = $el.attr("href");
            preventDefault = _aReg.test(href);
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
                hh = 0, // headerHeight - 45
                maxW = ww,
                maxH = wh - hh,
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
            this.image.top = sT + hh;
            var calcImageTop = (this.image.height - this.image.imageHeight - hh) / 2.0;
            this.image.imageTop = calcImageTop < 0 ? 0 : calcImageTop;
            this.image.calcImageTop = calcImageTop < 0 ? calcImageTop : 0;
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
        this.transitionObject.setDurationOnElement(this.image.$el, _animationTime);
        this.image.isAnchor ? this.transformObject.removeTransformOnElement(this.image.$el) :
        this.transformObject.setTransformOnElementFromParams(this.image.$el, params || {
            translateY: 0,
            translateX: 0,
            scaleX: 1,
            scaleY: 1
        });
        this.transitionObject.setDurationOnElement(this.image.$img, _animationTime);
        this.transformObject.setTransformOnElementFromParams(this.image.$img, {
            translateY: 0,
            translateX: 0,
            scaleX: 1,
            scaleY: 1
        });
    };

    lightbox.prototype.toggleZoom = function(e){
        if (!this.modal.open) return;
        if (!this.image.zoomed) {
            this.transformObject.setZoomOnElement(this.image.$img, e.center, _maxScale, this.image.center);
            this.image.zoomed = true;
            this.image.showInfo = false;
        } else {
            this.transformObject.setTransformOnElementFromParams(this.image.$img, {
                translateY: 0,
                translateX: 0,
                scaleX: 1,
                scaleY: 1
            });
            this.image.zoomed = false;
            this.image.showInfo = true;
            this.image.infoWasHidden = false;
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
        //TODO: figure out if we should really be using image.imageTop -- probably should, but probably need
        // to do some checking in there for image size so images don't cling to the top if the don't need to.
        // setting imageTop to 0 for now
        var w = image.imageWidth,
            h = image.imageHeight,
            left = params.translateX - w*(params.scaleX - 1)/ 2,
            top = params.translateY - h*(params.scaleY - 1)/ 2,
            imageTop = image.imageTop,
            onHorizontalEdge = false,
            onVerticalEdge = false;

        imageTop = 0;
        var newLeft = params.translateX;

        if (left >=0){
            newLeft = w*(params.scaleX - 1) /2;
            onHorizontalEdge = true;
        }else if (left <= -w*(params.scaleX -1)){
            newLeft = -w*(params.scaleX - 1) /2;
            onHorizontalEdge = true;
        }

        var newTop = params.translateY;
        if (top + imageTop >= 0){
            newTop = h*(params.scaleY - 1) /2 - imageTop;
            onVerticalEdge = true;
        }else if (top + imageTop <= -h*(params.scaleY - 1)){
            newTop = -h*(params.scaleY - 1) / 2 - imageTop;
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
        if (!this.modal.open || this.image.pinching) return;
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
                this.image.zoomed && this.transformObject.setTransformOnElementFromParams(this.image.$img, _getZoomParams(_startXY, e.center, _startParams, this.image));
                break;
            case "pancancel":
            case "panend":
                if (this.image.zoomed) {
                    var zoomParams = _getZoomParams(_startXY, e.center, _startParams, this.image);
                    this.transformObject.setTransitionTimeOnElement(this.image.$img, _animationTime);
                    if (zoomParams.onHorizontalEdge || zoomParams.onVerticalEdge) {
                        this.transformObject.setTransformOnElementFromParams(this.image.$img, zoomParams.edgeParams);
                    }
                }
                break;
        }
    };

    var _fixedPinchCenter, _unzoomedFixedPinchCenter, _initialScale;
    lightbox.prototype.handlePinch = function(e) {
        if (!this.modal.open) return;
        switch(e.type) {
            case "pinchstart":
                // get the fixed pinch center -- the center of the pinch on the screen
                _fixedPinchCenter = {
                    x: e.center.x,
                    y: e.center.y
                };
                // get the initial scale of the element
                _initialScale = this.transformObject.getTransformParamsFromElement(this.image.$img).scaleX;
                // calculate where the pinch center would be element was unzoomed
                _unzoomedFixedPinchCenter = {
                    x: (_fixedPinchCenter.x - this.image.$img.offset().left)/_initialScale + (window.innerWidth - this.image.imageWidth)/2,
                    y: (_fixedPinchCenter.y - (this.image.$img.offset().top - $(window).scrollTop()) - this.image.calcImageTop)/_initialScale + (window.innerHeight - this.image.imageHeight)/2
                };
                this.transitionObject.setDurationOnElement(this.image.$img, "0s");
                this.image.pinching = true;
                break;
            case "pinch":
                var scale = e.scale*_initialScale;
                this.transformObject.setZoomOnElement(this.image.$img, _unzoomedFixedPinchCenter, scale , null, _fixedPinchCenter);
                break;
            case "pinchcancel":
            case "pinchend":
                this.transitionObject.setDurationOnElement(this.image.$img, _animationTime);
                // first get the scale of the element and check if it's too large or too small
                // next get the final parameters for the element using the scale found above
                // next calculate if the element, with its new zoom, is too far over or up -- ie, if it's on the edge of the element
                var scale = e.scale*_initialScale > _maxScale ? _maxScale : (e.scale*_initialScale < _minScale ? _minScale : e.scale*_initialScale),
                    zoomOut = scale < _initialScale,
                    params = _onEdge(this.image, this.transformObject.getZoomParams(_unzoomedFixedPinchCenter, scale, null, _fixedPinchCenter)),
                    onEdge = params.onHorizontalEdge || params.onVerticalEdge;
                // so, if you're zooming in, you won't want to check the edge, but if you're zooming out, you will
                params = onEdge && zoomOut ? params.edgeParams : params;
                // if it's on the edge or it's too large or small, animate it back to where it should be.
                if ( (onEdge && zoomOut) || scale !== e.scale*_initialScale) {
                    this.transformObject.setTransformOnElementFromParams(this.image.$img, params);
                    this.$timeout(function(){this.image.pinching = false}, _animationTimeMS);
                } else {
                    this.$timeout(function(){this.image.pinching = false}, _animationTimeMS / 2.0);
                }
                this.image.zoomed = scale !== 1;
                if (!this.image.zoomed) {
                    this.image.showInfo = true;
                    this.image.infoWasHidden = false;
                }
                break;
        }
    };

    lightbox.prototype.createImage = function(){
        if (!this.image || this.image.$el) return;
        //#dc-lightbox-modal-item-template
        var template = $dc.viewParser.parse($("#dc-lightbox-modal-item-template").html());
        var $el =  template.getElement(
                {
                    parentScope: this,
                    image: _imageMap[this.image.href]
                }
            ),
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
            e.preventDefault();
            self.$call(self.handleDrag,e);
        });
        var pinch = new Hammer.Pinch();
        h.add(pinch);
        h.on("pinch pinchstart pinchend pinchcancel", function(e) {
            e.preventDefault();
            self.$call(self.handlePinch, e);
        });
        var hh = new Hammer($el[0]);
        hh.on("tap", function(e) {
            if ($(e.target).is("a, .a")) {
                return;
            }
            self.$call(self.toggleImageInfo, e);
        });
        this.addCancelPanListener($el);
    };

    lightbox.prototype.addCancelPanListener = function($el) {
        var self = this;
        var hh = new Hammer($el.length ? $el[0] : $el);
        hh.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        hh.on("pan panstart panend pancancel", function(e) {
            e.preventDefault();
            if (Math.abs(e.deltaY > 10)){
                if (!self.image.zoomed) {
                    self.hideModal();
                } else {
                    try {
                        e.srcEvent.stopPropagation();
                    } catch (e) {

                    }
                }
            }
        });
    };


    $dc.addDirective({
        name: name,
        directive: lightbox,
        $scope: {}
    });
})(name);
