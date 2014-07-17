displayName = function () {
    var user = Meteor.user();
    if (!user)
        return '';
    if (user.profile && user.profile.name)
        return user.profile.name;
    if (user.username)
        return user.username;
    if (user.emails && user.emails[0] && user.emails[0].address)
        return user.emails[0].address;
    return 'none';
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
    'click #login-buttons-logout': function () {
        Template.LoginForm.style.visibility = "visible";
    },
    'click #i_logout': function () {
        Meteor.logout();
    }
};

Template.UserName.helpers({
    userName: function () {
        return displayName();
    },

});