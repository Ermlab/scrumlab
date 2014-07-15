Meteor.startup(function () {
    // code to run on server at startup
});

Accounts.validateLoginAttempt(function (info) {
    console.log('validate', info, this.userId);
    return true;

});

Accounts.onLogin(function (info) {
    console.log('onLogin', info, this.userId);
});


// Serverside functions
Server = {
    foo: function () {
        console.log("Called server side function");
    }
};