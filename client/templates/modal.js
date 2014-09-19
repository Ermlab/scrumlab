Template.modal.templateName = function() {
    var modal = Session.get("modal");
    if (modal !== undefined) {
        return modal.template || 'modalUndefined';
    }
}

Template.modal.backdropClose = function() {
    /*
    if (modal !== undefined) {
        return modal.template || 'modalUndefined';
    }
    */
    return "true";
    //static
}


Template.modal.templateData = function() {
    var modal = Session.get("modal");
    if (modal !== undefined) {
        return modal.data || JSON.stringify(modal);
    }
}