var name = "directive.sortable";
(function(name){
    var sortable = function(){};

    sortable.prototype.init = function() {
        console.log(this);
        this.releaseDragging();
        this.$watchArray('items', function(){
            // This will fire after the repeat event, so let the element be spliced in (created and added to DOM), then release dragging.
           this.$timeout(this.releaseDragging);
        });
    };

    sortable.prototype.onDragStart = function(e, item, idx) {
        this.setDragging(e, item, idx);
    };

    sortable.prototype.onDragEnter = function(e, item, idx) {
        if (item.isDragging) return;
        $(e.currentTarget.parentNode)[this.$draggingEl.index() < $(e.currentTarget.parentNode).index() ? 'after' : 'before'](this.$draggingEl);
    };

    sortable.prototype.onDragOver = function(e, item, idx) {
      return this.onDragEnter(e, item, idx);
    };

    sortable.prototype.onDragEnd = function(e, item, idx) {
        var newIndex = this.$draggingEl.index(),
            oldIndex = this.draggingIndex;

        if (newIndex === oldIndex) return this.releaseDragging();

        var item = this.items.splice(oldIndex,1)[0];
        this.items.splice(newIndex, 0, item);
        this.draggingSwapIndex = newIndex;
        this.$call(this.onChange);
    };

    sortable.prototype.setDragging = function(e, item, idx) {
        item.isDragging = true;
        this.draggingItem = item;
        this.draggingIndex = idx;
        this.$draggingEl = $(e.currentTarget.parentNode);
    };

    sortable.prototype.releaseDragging = function() {
        if (this.draggingItem) this.draggingItem.isDragging = false;
        this.draggingItem = null;
        this.draggingIndex = null;
        this.$draggingEl = null;
        this.draggingSwapIndex = null;
    };

    $dc.addDirective({
        name: name,
        directive: sortable,
        template: '#dc-directive-sortable-template',
        $scope: {
            onChange: '&sortable-on-change',
            items: '=sortable-items',
            options: '=sortable-options',
            itemTemplate: '@sortable-item-template'
        }
    });

})(name);