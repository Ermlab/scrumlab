OnElementReady = function(selector, fcn) {
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