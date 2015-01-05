var name = "directive.gameImage";
(function(name){
    var gameImage = function() {

        this.init = function(){
            // maybe init the embed here
            console.log("init i think?");
        }
    };
    $dc.directive.add(name,{
        'directive': gameImage,
        'template': "#dc-directive-game-image-template"
    });
})(name);