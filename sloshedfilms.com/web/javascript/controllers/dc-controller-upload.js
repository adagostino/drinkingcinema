var name = "controller.upload";
(function(name){
    var upload = new function(){
        var $scope;



        this.init = function(){
            $scope = this;

            this.game = {
                tags: "Party"
            };
            
            this.tags = {
                content: this.game.tags,
                isRTE: true,
                submit: function() {
                    this.processing = true;
                    this.$timeout(function(){
                        this.editing = false;
                        this.processing = false;
                        $scope.game.tags = this.content;
                        console.log($scope.game);
                    }, 1000)
                }
            };


        };
    };
    $dc.extend(name, upload);
})(name);