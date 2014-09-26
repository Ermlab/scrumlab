XEditableUpdate = function(collection, editable, value) {
    var id = $(editable).data('pk');
    var field = $(editable).data('name');
    if (id && field) {
        var update = {};
        update[field] = value;
        console.log(update);
        collection.update(id, {$set: update});
        console.log(collection.findOne(id));
        console.log($(editable).text());
    }
}

OnElementReady = function(selector, fcn) {
    if (typeof selector == "string") {
        console.log("OnElementReady() with selector "+selector+" is deprecated, use jquery object instead");
        if ($(selector).length) {
            fcn(selector);
        }
        else {
            var id = Meteor.setInterval(function() {
                if ($(selector).length) {
                    Meteor.clearInterval(id);
                    fcn(selector);
                }
            }, 100);
        }        
    }
    else {
        var obj = selector;
        if (obj.length) {
            fcn(obj);
        }
        else {
            var id = Meteor.setInterval(function() {
                if (obj.length) {
                    Meteor.clearInterval(id);
                    fcn(obj);
                }
            }, 100);
        }        
    }
}

jQuery.fn.selectText = function(){
   var doc = document;
   var element = this[0];
   if (doc.body.createTextRange) {
       var range = document.body.createTextRange();
       range.moveToElementText(element);
       range.select();
   } else if (window.getSelection) {
       var selection = window.getSelection();        
       var range = document.createRange();
       range.selectNodeContents(element);
       selection.removeAllRanges();
       selection.addRange(range);
   }
};