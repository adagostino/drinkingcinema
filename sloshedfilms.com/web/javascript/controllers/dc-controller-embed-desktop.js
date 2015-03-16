var name = "controller.embed.desktop";
(function(name){
    var controller = function(){
        var $scope;

        this.resize = function(){
            // embedHeight = windowHeight = 2*padding + headerHeight + hrMargin + hrHeight + hrMargin + gameHeight + 2*padding
            // windowHeight - 2*(padding + hrMargin) = headerHeight + hrHeight + gameHeight;
            //
            // embedWidth = gameHeight * (8.5/11);
            // headerHeight = embedWidth * (100/800);
            // hrHeight = embedWidth * (16/750);
            // so
            // windowHeight - 2*(padding + hrMargin) = embedWidth * (100/800) + embedWidth * (16/750) + embedWidth * (11/8.5);
            // embedWidth = (windowHeight - 2*(padding + hrMargin) ) / (1/8 + 16/750 + 11/8.5);
            var padding = 10,
                hrMargin = 5,
                wh = $(window).height();
            var width = (wh - 4*padding + 2*hrMargin) / (1/8 + 16/750 + 11/8.5);
            this.embedWidth = Math.floor(width);
        };

        this.showRules = function(){
            if (this.showingRules) return;
            this.showingRules = true;
        };

        this.hideRules = function(e){
            e.preventDefault();
            e.stopPropagation();
            this.hideSocialMedia();
            this.showingRules = false;
        };

        this.toggleSocialMedia = function(e){
            e.preventDefault();
            e.stopPropagation();
            this.showingSocialMedia = !this.showingSocialMedia;
        };

        this.hideSocialMedia = function(){
            this.showingSocialMedia = false;
        };

        this.init = function(){
            $scope = this;
            this._super();
            $dc.initImageToolTip();

            this.$timeout(function(){
                this.resize();
                this.showing = true;
            });

            $(window).resize(function(){
                $scope.$call($scope.resize);
            });


        };

    };

    $dc.add(name, controller);
})(name);
