var name = "directive.autocomplete";
(function(name){
    var dataStore = function(opts){
        // should be of structure {name: str, version: str, items: {id: item}, suggestions: {searchTerm: array[id]}
        this.name = opts.name;
        this.version = opts.version;
        this.suggestions = opts.suggestions || {};
        this.items = opts.items || {};
    };

    dataStore.prototype.get = function(key){
        if (!key) return [];
        var idArray = this.suggestions[key];
        if (!idArray) return;
        var values = [];
        for (var i=0; i<idArray.length; i++) {
            values.push(this.items[idArray[i]] || idArray[i]);
        }
        return values;
    };

    dataStore.prototype.set = function(key, valueArray) {
        if (this.suggestions[key]) return;
        if (!valueArray) valueArray = [];
        var formattedArray = [];
        for (var i=0; i<valueArray.length; i++) {
            var item = valueArray[i];
            if (item.id) {
                if (!this.items[item.id]) this.items[item.id] = item;
                item = item.id;
            }
            formattedArray.push(item);
        }
        this.suggestions[key] = formattedArray;
    };

    dataStore.prototype.commitToLocal = function(){
        if (this.name && this.version){
            $dc.utils.setLocal(this.name, {
                version: this.version,
                items: this.items,
                suggestions: this.suggestions
            });
        }
    };


    var autocomplete = function(){};

    autocomplete.prototype.init = function() {
        this.rawSearchTerms = "";
        this.searchTerms = "";
        this.searchResults = [];
        this.initModal();
        this.initDataStore();
        this.$watch("rawSearchTerms", function(n, o){
            this.searchTerms = $.trim($dc.utils.getText(this.rawSearchTerms));
        });
        this.$watch("searchTerms", this.getResults);
        window.scope = this;
    };

    autocomplete.prototype.getResults = function(searchTerm) {
        var storedValues = this.storedSuggestions.get(searchTerm);
        if (!storedValues) {
            this.get(searchTerm);
        } else {
            this.searchResults = storedValues;

        }
    };

    autocomplete.prototype.setResults = function(resultsArray, forSearchTerm) {
        this.storedSuggestions.set(forSearchTerm, resultsArray);
        this.searchTerms === forSearchTerm && this.getResults(forSearchTerm);
    };

    autocomplete.prototype.showModal = function() {
        this.scrollTop = $(window).scrollTop();
        this.modal.show();

    };

    autocomplete.prototype.hideModal = function() {
        this.modal.hide();
    };

    autocomplete.prototype.initDataStore = function() {
        // this.storedSuggestions = {name: dataStoreName, version: versionString, suggestions: {searchTermString : arrayOfResults}}
        this.storedSuggestions = new dataStore({
            name: this.dataStoreName,
            version: undefined,
            suggestions: {}
        });
        try {
            this.version = $dc.utils.getJSON('pageJSON', 'dc-page-json').versions[this.dataStore];
        } catch(e) {
            return;
        }
        if (!this.version) return;
        var storedSuggestions = $dc.utils.getLocal(this.dataStoreName);
        storedSuggestions = storedSuggestions ? JSON.parse(storedSuggestions) : {};
        if (this.version !== storedSuggestions.version){
            this.storedSuggestions.version = this.version;
        } else {
            this.storedSuggestions.suggestions = storedSuggestions.suggestions;
        }
    };

    autocomplete.prototype.setDataStore = function() {
        this.storedSuggestions.commitToLocal();
    };

    autocomplete.prototype.initModal = function() {
        var self = this;
        var opts = {
            'modalTemplate': this.modalTemplate,//"#dc-autocomplete-search-modal-template"
            'itemTemplate': this.itemTemplate,
            'parentScope': this,
            'beforeShow': function(){
                //$(window).scrollTop(0);
                //$(".dc-background").css("height", "100vh").scrollTop(self.scrollTop);
                //$(window).scrollTop(0);
                this.$timeout(function(){$(window).scrollTop(0)});
            },
            'beforeHide': function(){
                //$(".dc-background").scrollTop(0).css("height", "auto");
                //$(window).scrollTop(self.scrollTop);
            },
            'afterHide': function(){
                this.$timeout(function(){$(window).scrollTop(self.scrollTop)});
            }
        };

        this.modal = $dc.service.modal(opts);
    };

    $dc.addDirective({
        name: name,
        directive: autocomplete,
        template: function($scope){
            var template = $scope.$el.html();
            $scope.$el.empty();
            return template;
        },
        $scope: {
            modalTemplate: "@modal-template",
            itemTemplate: "@item-template",
            get: "&getter",
            dataStoreName: "@data-store"
        }
    });
})(name);