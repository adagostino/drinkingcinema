var name = "controller.game.desktop.admin";
(function(name){
    var controller = function(){
        var $scope;

        this.submit = function(key){
            if ($scope.game[key] !== this.content){
                this.processing = true;
                var game = {
                    name: $scope.game.name
                };
                game[key] = this.content;
                $dc.model.game.postGameUpdate({
                    $scope: this,
                    game: game,
                    success: function(data){
                        console.log("success", data);
                        this.processing = false;
                        this.editing = false;
                        this.content = data[key];
                        $scope.game[key] = this.content;
                    },
                    error: function(err, xhr){
                        alert(JSON.stringify(err));
                        this.processing = false;

                    }
                });
            }else {
                this.editing = false;
            }
        };

        this.submitTags = function(){
            this.$call($scope.submit,"tags");
        };

        this.submitRules = function(){
            this.$call($scope.submit,"rules");
        };

        this.submitOptionalRules = function(){
            this.$call($scope.submit,"optionalRules");
        };

        this.init = function(){
            this._super();
            this.isAdmin = true;
            $scope = this;
        }
    };

    $dc.add(name, controller);
})(name);