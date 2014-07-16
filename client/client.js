Meteor.startup(function () {
    // code to run on server at startup
});


Meteor.loginWithGitlabAccount = function (email, password, callback) {
    var loginRequest = {
        email: email,
        password: password
    };

    Accounts.callLoginMethod({
        methodArguments: [loginRequest],
        userCallback: callback
    });

    console.log("Logging in as", loginRequest);
};
