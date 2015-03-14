var name = "controller.page.desktop.admin";
(function(name){

    var controller = function(){
        var $scope;

        this.submitContent = function(){
            if ($scope.page.content !== this.content){
                this.processing = true;
                $dc.model.page.postUpdate({
                    '$scope': this,
                    'pageName': $scope.page.page.pageName,
                    'content': this.content,
                    'success': function(data){
                        this.processing = false;
                        this.editing = false;
                        this.content = data["content"];
                        $scope.page.page.content = this.content;
                    },
                    'error': function(err, xhr){
                        console.log("error", arguments);
                        this.errors = err.errors;
                        this.processing = false;
                    }
                })
            };
        };

        this.init = function(){
            $scope = this;
            this._super();
            this.isAdmin = this.page.isAdmin;

        }
    };

    $dc.add(name, controller);
})(name);
