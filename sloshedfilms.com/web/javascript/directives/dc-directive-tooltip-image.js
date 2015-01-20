var name = "directive.tooltip.image";
(function(name){

    // as we get images, place them in here and check if they are loaded or not already
    var _imageMap = {};
    var reg = new RegExp($dc.globals.cdn + "uli","i");

    var defaults = {
        'mouseenter': function(e){
            var $a = $(e.target),
                href = e.target.href;
            if (reg.test(href)){
                this.delegate = $a;
                this._super(e);

            }
        },
        'setContent': function(clone){
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
        }
    }

    var imageToolTip = function(opts){
        var $scope;

        // private _addImage function to keep track of already loaded images
        this.getImage = function(href, callback) {
            var image = _imageMap[href];
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
                    $scope.call(callback, _imageMap[href]);
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

        this.positionToolTip = function(){
          this._super(this.delegate);
        };

        this.setToolTip = function(){
            this._super("dc-tooltip-image");
        };

        this.init = function(){
            $scope = this;
            if (!this.$el) this.$el = $("body");
            this.contentTemplate = this.$el.attr("tooltip-template") || "#dc-tooltip-image-template";
            this.$el.on("mouseenter","a",function(e){
                $scope.call($scope.mouseenter,e);
            }).on("mouseleave","a",function(e){
                $scope.call($scope.mouseleave,e);
            });

        }
    };

    $dc.directive.add(name, {
        "directive": imageToolTip,
        "defaults": defaults
    });
})(name);
