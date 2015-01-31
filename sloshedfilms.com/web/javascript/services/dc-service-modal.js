var name = "service.modal";
(function(){
    var modalService = function(opts){
        var modalClass = $dc.subClass(opts,$dc.directive.modal),
            modal = new modalClass();
        modal.parentScope && modal.$call(modal.parseIsolateScope);
        modal.init();
        return modal;
    };
    $dc.addService(name, modalService);
})(name);