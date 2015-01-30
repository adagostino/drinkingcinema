var name = "controller.comments";
(function(name){
    var controller = function(){

        this.init = function(){
            this.comments = $dc.utils.getJSON('commentJSON','dc-comment-json');
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

    $dc.add(name, controller);
})(name);
