Template.navUserLogin.events = {
    'click #signIn': function () {

        var email = iEmail.value;

        var password = inputPassword3.value;

        Meteor.loginWithGitlabAccount(email, password);
    },
    'keypress #inputPassword3': function (event) {

        if (event.which == 13 || event.keyCode == 13) {

            var email = iEmail.value;

            var password = inputPassword3.value;

            Meteor.loginWithGitlabAccount(email, password);

            iEmail.value = '';

            inputPassword3.value = '';

            return false;
        }
        return true;
    },
    'click #userLogout': function () {
        Meteor.logout();
    }
};