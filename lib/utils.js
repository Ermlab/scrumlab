// Utility functions for both client and server

var Hide;

Utils = {
    foo: function (x) {
        console.log(x);
        Deprecated("Utils.foo", "Utils.bar");
    }
}

Deprecated = function (oldFcn, newFcn) {
    if (newFcn) {
        hint = " Use " + newFcn + "() instead.";
    }
    console.warn(oldFcn + "() is deprecated." + hint);
}

CheckDate = function (date) {
    // Returns true if given date > current date
    // Assuming string input "MM/DD/YYYY" of jquery datepicker
    var curDate = new Date();
    var splitDate = date.split('/');
    var testDate = new Date(Number(splitDate[2]), Number(splitDate[0]) - 1, Number(splitDate[1]));
    if (testDate > curDate) return true;
    else return false;
}