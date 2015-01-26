var name = "controller.comments";
(function(name){
    var controller = new function(){

        this.init = function(){
            this.comments = $dc.model.getJSON('commentJSON','dc-comment-json');
            this.comment = {
                name: '',
                email: '',
                subject: '',
                website: '',
                comment: ''
            };
            window.scope = this;
        }
    };

    $dc.extend(name, controller);
})(name);
