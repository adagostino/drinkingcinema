(function(scope){

    var $dc = new function(){
        this.extend = function(name, o) {
            if (!name || !o) return;
            this[name] = o;
            return this;
        };

        this.subClass = function(parent, child){
            var c = Object.subClass.call(parent, child);
            return new c();
        };
    };

    scope.drinkingCinema = scope.$dc = $dc;
})(window);
