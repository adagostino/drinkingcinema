var name = "model.comments";
(function(name){
    var commentModel = new function(){
        this.$pre = $("<pre>");

        this.getText = function(html){
            // kind of bootleg way of doing this -- it's not meant as a way of sanitizing
            // the input, more of a way to preserve line breaks for when I format the input
            // on the backend
            // http://stackoverflow.com/questions/3455931/extracting-text-from-a-contenteditable-div
            this.$pre.html(html);
            this.$pre.find("p").replaceWith(function() { return this.innerHTML + "<br>"; });
            this.$pre.find("div").replaceWith(function() { return "\n" + this.innerHTML; });
            this.$pre.find("br").replaceWith("\n");

            return this.$pre.text();
        };



    };

    $dc.extend(name,commentModel);
})(name);