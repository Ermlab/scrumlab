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

Template.masterLayout.events = {
    'click #i_confirm': function () {

        var email = i_email.value;

        var password = i_password.value;

        Meteor.loginWithGitlabAccount(email, password);
    },
    'keypress #i_password': function (event) {

        if (event.which == 13 || event.keyCode == 13) {
            var email = i_email.value;

            var password = i_password.value;

            Meteor.loginWithGitlabAccount(email, password);

            i_password.value = '';
            
            i_email.value = '';

            return false;
        }
        return true;
    },
    'click #login-buttons-logout': function()
    {
        LoginPanel.style.visibility = "visible";
    }
};