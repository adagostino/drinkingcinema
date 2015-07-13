var name = "controller.slideshow";
(function(name){

    var controller = function(){
        var $scope;

        this.init = function(){
            $scope = this;
            this.page = $dc.utils.getJSON('pageJSON', 'dc-page-json');
            this.slideshow = this.page.slideshow;
            this.slideshow.slides = this.slideshow.slides || [];
            for (var i=0; i<this.slideshow.slides.length; i++) {
                this.slideshow.slides[i] = new $dc.service.slide(this.slideshow.slides[i]);
            }


        };
    };

    $dc.add(name, controller);
})(name);
