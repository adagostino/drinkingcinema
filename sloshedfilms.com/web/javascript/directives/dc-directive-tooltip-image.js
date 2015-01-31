var name = "directive.tooltip.image";
(function(name){

    // as we get images, place them in here and check if they are loaded or not already
    var _imageMap = {};
    var reg = new RegExp($dc.globals.cdn + "uli","i");

    var imageToolTip = function(){};

    imageToolTip.prototype.init = function(){
        var self = this;
        if (!this.$el) this.$el = $("body");
        this.contentTemplate = this.$el.attr("tooltip-template") || "#dc-tooltip-image-template";
        this.$el.on("mouseenter","a",function(e){
            self.$call(self.mouseenter,e);
        }).on("mouseleave","a",function(e){
            self.$call(self.mouseleave,e);
        });
    };

    // private _addImage function to keep track of already loaded images
    imageToolTip.prototype.getImage = function(href, callback) {
        var image = _imageMap[href],
            self = this;
        if (!image) {
            var img = new Image();
            // use jquery just so i don't have to worry about older browsers (even though I probably shouldn't worry
            // at all
            $(img).one("load",function(e){
                _imageMap[href] = {
                    width: e.target.naturalWidth,
                    height: e.target.naturalHeight,
                    href: href,
                    loaded: true
                };
                self.$call(callback, _imageMap[href]);
            });
            img.src = href;
        }
        return image || {
                width: 16,
                height: 16,
                href: href,
                loaded: false
            };
    };

    imageToolTip.prototype.positionToolTip = function(){
        this._super(this.delegate);
    };

    imageToolTip.prototype.setToolTip = function(){
        this._super("dc-tooltip-image");
    };

    imageToolTip.prototype.setContent = function(clone){
        this[clone ? "cttScope" : "ttScope"].image = this.getImage(this.delegate[0].href, function(image){
            if (this.delegate[0].href === image.href) {
                this.cttScope.image = image;
                var w = image.width, h = image.height;
                if (w > 200) {
                    w = 200;
                    h = w* image.height/image.width;
                }
                if (h > 150) {
                    h = 150;
                    w = h * (image.width/image.height);
                }
                this.ttScope.image = image;
                this.ttScope.marginLeft = -w/2 - 10;
            }
        });
    };

    // Events:
    imageToolTip.prototype.mouseenter = function(e){
        var $a = $(e.target),
            href = e.target.href;
        if (reg.test(href)){
            this.delegate = $a;
            this._super(e);

        }
    };

    imageToolTip.prototype.mouseleave = function(e){
        reg.test(e.target.href) && this._super(e);
    };

    $dc.addDirective({
        name: name,
        directive: imageToolTip,
        $scope: {}
    });
})(name);
