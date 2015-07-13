var name = "directive.slideshowModal";
(function(name){
    var _animationTime = "0.6s",
        _maxScale = 3,
        _minScale = 1;


    var _animationTimeMS = 0;
    _animationTime.replace(/(\d*\.*\d*)(s|ms)/, function(match,duration,durationUnit){
        _animationTimeMS = durationUnit === "s" ? parseFloat(duration)*1000 : parseFloat(duration)
    });

    var slideshowModal = function(){};

    slideshowModal.prototype.init = function(){
        this.imgMap = {};
        this.transformObject = new $dc.service.transformObject();
        this.transitionObject = new $dc.service.transitionObject();

        this.$watch('currentSlideIndex', function(n){
            this.resizeSlides();
        });

        $(window).on('resize', function(){
            this.$call(this.resizeSlides);
        }.bind(this));

        this.initModal();
    };

    slideshowModal.prototype.initModal = function(){
        var self = this;
        var opts = {
            'slides': this.slides,
            'modalTemplate': '#dc-slideshow-modal-lightbox-template',
            'parentScope': this,
            'beforeShow': function(){
                //self.resizeSlides();

                //$(".dc-background").css("height", "100vh").scrollTop(self.scrollTop);
                //$(window).scrollTop(0);
            },
            'afterShow': function(){
                self.carousel.setToIndex(self.currentSlideIndex, 0);

                //$(".dc-background").css("height", 0);
            },
            'beforeHide': function(){},
            'afterHide': function(){}
        };

        this.modal = $dc.service.modal(opts);
        this.setTouchListeners();
        this.carousel = $dc.getScope(this.modal.$el.find('.dc-carousel')[0]);

        /*
        this.modal.$el.each(function(){
            self.$call(self.addCancelPanListener(this));
        });
        */
    };

    slideshowModal.prototype.showModal = function(idx){
        this.currentSlideIndex = idx;
        this.resizeSlides();
        this.modal.show();
    };

    slideshowModal.prototype.hideModal = function(){
        this.modal.hide();
    };

    slideshowModal.prototype.setTouchListeners = function(){
        var self = this;
        var h = new Hammer(this.modal.$el[0]);
        // fix the threshold of the doubletap so that there are less missed gestures
        h.get('doubletap').set({ threshold: 80, posThreshold: 80 });
        h.on("doubletap", function(e) {
            e.preventDefault();
            if (!$(e.target).is(".dc-slideshow-modal-item-img")) return;
            self.$timeout(function(){self.$call(self.toggleZoom, e);});
        });
        // set the diretion of pan to all
        h.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        h.on("pan panstart panend pancancel", function(e){
            (e.srcEvent || e).stopPropagation();
            if (!$(e.target).is(".dc-slideshow-modal-item-img")) {
                if (_isDragging) {
                    _currentEvent.type = 'pancancel';
                    self.$call(self.handleDrag, _currentEvent);
                }
                return;
            }
            if (!_isDragging) e.type = 'panstart';
            self.$call(self.handleDrag,e);
        });
        var pinch = new Hammer.Pinch();
        h.add(pinch);
        h.on("pinch pinchstart pinchend pinchcancel", function(e) {
            e.preventDefault();
            if (!$(e.target).is(".dc-slideshow-modal-item-img")) {
                if (_isPinching) {
                    _currentEvent.type = 'pinchcancel';
                    self.$call(self.handlePinch, _currentEvent);
                }
                return;
            }
            if (!_isPinching) e.type = 'pinchstart';
            self.$call(self.handlePinch, e);
        });

    };

    slideshowModal.prototype.onChange = function(idx, time){
        // this.$scope is slideshowModal
        this.$scope.currentSlideIndex = idx;
    };

    slideshowModal.prototype.toggleZoom = function(e){
        if (!this.modal.open || !this.slides[this.currentSlideIndex].loaded) return;
        var slide = this.slides[this.currentSlideIndex];
        if (!slide.zoomed) {
            this.transformObject.setZoomOnElement($(e.target), e.center, _maxScale, slide.center);
            slide.zoomed = true;
        } else {
            this.transformObject.setTransformOnElementFromParams($(e.target), {
                translateY: 0,
                translateX: 0,
                scaleX: 1,
                scaleY: 1
            });
            slide.zoomed = false;
        }
    };

    var _fixedPinchCenter, _unzoomedFixedPinchCenter, _initialScale, _isPinching;
    slideshowModal.prototype.handlePinch = function(e) {
        if (!this.modal.open || !this.slides[this.currentSlideIndex].loaded) return;
        var $img = $(e.target);
        var slide = this.slides[this.currentSlideIndex];
        switch(e.type) {
            case "pinchstart":
                // get the fixed pinch center -- the center of the pinch on the screen
                _fixedPinchCenter = {
                    x: e.center.x,
                    y: e.center.y
                };
                // get the initial scale of the element
                _initialScale = this.transformObject.getTransformParamsFromElement($img).scaleX;
                // calculate where the pinch center would be element was unzoomed
                _unzoomedFixedPinchCenter = {
                    x: (_fixedPinchCenter.x - $img.offset().left)/_initialScale + (window.innerWidth - slide.imageWidth)/2,
                    y: (_fixedPinchCenter.y - ($img.offset().top - $(window).scrollTop()) - slide.calcImageTop)/_initialScale + (window.innerHeight - slide.imageHeight)/2
                };
                this.transitionObject.setDurationOnElement($img, "0s");
                slide.pinching = true;
                _currentEvent = e;
                _isPinching = true;
                break;
            case "pinch":
                var scale = e.scale*_initialScale;
                _currentEvent = e;
                this.transformObject.setZoomOnElement($img, _unzoomedFixedPinchCenter, scale , null, _fixedPinchCenter);
                break;
            case "pinchcancel":
            case "pinchend":
                this.transitionObject.setDurationOnElement($img, _animationTime);
                // first get the scale of the element and check if it's too large or too small
                // next get the final parameters for the element using the scale found above
                // next calculate if the element, with its new zoom, is too far over or up -- ie, if it's on the edge of the element
                var scale = e.scale*_initialScale > _maxScale ? _maxScale : (e.scale*_initialScale < _minScale ? _minScale : e.scale*_initialScale),
                    zoomOut = scale < _initialScale,
                    params = _onEdge(slide, this.transformObject.getZoomParams(_unzoomedFixedPinchCenter, scale, null, _fixedPinchCenter)),
                    onEdge = params.onHorizontalEdge || params.onVerticalEdge;
                // so, if you're zooming in, you won't want to check the edge, but if you're zooming out, you will
                params = onEdge && zoomOut ? params.edgeParams : params;
                // if it's on the edge or it's too large or small, animate it back to where it should be.
                if ( (onEdge && zoomOut) || scale !== e.scale*_initialScale) {
                    this.transformObject.setTransformOnElementFromParams($img, params);
                    this.$timeout(function(){slide.pinching = false}, _animationTimeMS);
                } else {
                    this.$timeout(function(){slide.pinching = false}, _animationTimeMS / 2.0);
                }
                slide.zoomed = scale !== 1;
                if (!slide.zoomed) {
                    //this.image.showInfo = true;
                    //this.image.infoWasHidden = false;
                }
                _currentEvent = null;
                _isPinching = false;
                //this.ax.logEvent($dc.ax.action.PINCH);
                break;
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
        var horizontalEdge = null;
        if (left >=0){
            newLeft = w*(params.scaleX - 1) /2;
            onHorizontalEdge = true;
            horizontalEdge = 1;
        }else if (left <= -w*(params.scaleX -1)){
            newLeft = -w*(params.scaleX - 1) /2;
            onHorizontalEdge = true;
            horizontalEdge = -1;
        }

        var newTop = params.translateY;
        if (top + imageTop >= 0){
            newTop = h*(params.scaleY - 1) /2 - imageTop;
            onVerticalEdge = true;
        }else if (top + imageTop <= -h*(params.scaleY - 1)){
            newTop = -h*(params.scaleY - 1) / 2 - imageTop;
            onVerticalEdge = true;
        }
        params.horizontalEdge = horizontalEdge;
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

    var _startParams, _startXY, _startTop, _scrollTop, _currentParams, _currentEvent, _isDragging;
    slideshowModal.prototype.handleDrag = function(e) {
        var slide = this.slides[this.currentSlideIndex];
        if (!this.modal.open || slide.pinching) return;
        var $img = $(e.target);
        switch(e.type) {
            case "panstart":
                if (slide.zoomed) {
                    this.transformObject.setReferenceTransformFromElement($img);
                    this.transformObject.setTransitionTimeOnElement($img, "0s");
                    _startParams = this.transformObject.getReferenceParams();
                    _startXY = e.center;
                    _startTop = slide.top;
                    _scrollTop = $(window).scrollTop();
                    _currentParams = _getZoomParams(_startXY, e.center, _startParams, slide);
                    _currentEvent = e;
                    _isDragging = true;
                }
                break;
            case "pan":
                _currentParams = _getZoomParams(_startXY, e.center, _startParams, slide);
                _currentEvent = e;
                slide.zoomed && this.transformObject.setTransformOnElementFromParams($img, _currentParams);
                break;
            case "pancancel":
            case "panend":
                if (slide.zoomed) {
                    var zoomParams = _getZoomParams(_startXY, e.center, _startParams, slide);
                    this.transformObject.setTransitionTimeOnElement($img, _animationTime);
                    if (zoomParams.onHorizontalEdge || zoomParams.onVerticalEdge) {
                        this.transformObject.setTransformOnElementFromParams($img, zoomParams.edgeParams);
                    }
                    _currentParams = null;
                    _currentEvent = null;
                    _isDragging = false;
                    //this.logEvent($dc.ax.action.PAN);
                }
                break;
        }
    };

    slideshowModal.prototype.resizeSlides = function() {
        var idx = this.currentSlideIndex || 0;
        this.modal.height =  window.innerHeight || document.documentElement.offsetHeight;
        this.scrollTop = this.modal.scrollTop = $(window).scrollTop();
        this.sizeImage(this.getSlideByIndex(idx - 1));
        this.sizeImage(this.getSlideByIndex(idx));
        this.sizeImage(this.getSlideByIndex(idx + 1));
    }

    slideshowModal.prototype.getSlideByIndex = function(idx) {
        if (idx < 0) return;
        if (idx >= this.slides.length) return;
        return this.slides[idx];
    };

    slideshowModal.prototype.getImage = function(slide) {
        if (!slide.loaded && !this.imgMap[slide.url]) {
            this.imgMap[slide.url] = slide;
            this._fetchImage(slide);
        }
    };

    slideshowModal.prototype._fetchImage = function(slide){
        var img = new Image();
        // use jquery just so i don't have to worry about older browsers (even though I probably shouldn't worry
        // at all
        $(img).one("load", function(e){
            slide.naturalWidth = e.target.naturalWidth;
            slide.naturalHeight = e.target.naturalHeight;
            slide.src = slide.url;
            slide.loaded = true;
            this.$call(this.sizeImage, slide);
        }.bind(this));
        img.src = slide.url;
    };

    slideshowModal.prototype.sizeImage = function(slide) {
        if (!slide) return;
        if (!slide.loaded && !this.imgMap[slide.url]) {
            this.getImage(slide);
            return;
        }

        var ww = window.innerWidth,
            wh = window.innerHeight,
            sT = $(window).scrollTop(),
            hh = 0, // headerHeight - 45
            maxW = ww,
            maxH = wh - hh,
            w = slide.naturalWidth,
            h = slide.naturalHeight;
        if (w > maxW) {
            w = maxW;
            h = w* slide.naturalHeight/slide.naturalWidth;
        }
        if (h > maxH) {
            h = maxH;
            w = h * (slide.naturalWidth/slide.naturalHeight);
        }
        slide.width = ww;
        slide.imageWidth = w;
        slide.height = maxH;
        slide.imageHeight = h;
        slide.marginLeft = -ww/2;
        slide.imageMarginLeft = -w/2;
        slide.top = sT + hh;
        var calcImageTop = (slide.height - slide.imageHeight - hh) / 2.0;
        slide.imageTop = calcImageTop < 0 ? 0 : calcImageTop;
        slide.calcImageTop = calcImageTop < 0 ? calcImageTop : 0;
        slide.center = {
            x: ww / 2,
            y: wh / 2 - (calcImageTop < 0 ? calcImageTop : 0) // - (this.image.height - this.image.imageHeight - 45)/2
        };
    };

    slideshowModal.prototype.onCarouselDrag = function(e) {
        var isZoomed = this.$scope.slides[this.$scope.currentSlideIndex].zoomed;
        var onEdge = _currentParams ? e.deltaX/Math.abs(e.deltaX) === _currentParams.horizontalEdge: false;

        return !isZoomed; // || (isZoomed && onEdge);
    };

    $dc.addDirective({
        name: name,
        directive: slideshowModal,
        template: '#dc-directive-slideshow-modal-template',
        $scope: {
            'slides': '=slideshow-slides',
            'thumbnailTemplate': '@slideshow-thumbnail-template'
        }
    });
})(name);
