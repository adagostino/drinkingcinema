(function(scope){
    scope.drinkingCinema = scope.$dc = new function(){
        // a simple extend for now
        this.extend = function(name, o){
            if (!name || !o) return;
            this[name] = o;
            return this;
        };
    };
})(window);
