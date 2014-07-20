/* --- client subscribe section ---*/

//subscribe for user profile Data in order to have access to gitlab user
Meteor.subscribe("userData");


Meteor.startup(function () {
    // code to run on server at startup
});


/*--- Meteor system hooks ---*/
Meteor.loginWithGitlabAccount = function (email, password, callback) {
    var loginRequest = {
        email: email,
        password: password
    };

    Accounts.callLoginMethod({
        methodArguments: [loginRequest],
        userCallback: callback
    });
};