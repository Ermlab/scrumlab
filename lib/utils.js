// Utility functions for both client and server

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