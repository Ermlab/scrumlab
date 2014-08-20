Template.serverLogin.errorMessage = function () {
    return Session.get('loginErrorMessage');
};


Template.serverLogin.events = {
    'blur #emailInput': function () {
        // Check user databse for e-mail, then check servers database for found origin
        Meteor.call('getGitlabServerIds', emailInput.value, function (error, data) {
            var serverList = $("#servers");
            var servers = GitlabServers.find({
                '_id': {
                    $in: data
                }
            }).fetch();
            if (servers.length == 1) {

                serverList.empty();
                serverInput.value = servers[0].url;
                var option = $("<option></option>").attr("value", servers[0].url).attr("id", servers[0]._id);
                serverList.append(option);
            } else if (servers.length > 1) {

                serverList.empty();
                serverInput.placeholder = 'GitLab server(s) found';
                _.each(servers, function (server) {
                    var option = $("<option></option>").attr("value", server.url).attr("id", server._id);
                    serverList.append(option);
                });
            } else {
                serverList.empty();
                serverInput.placeholder = 'GitLab server';
            }
        });
    },

    'submit form': function (e) {
        Session.set('loginErrorMessage', undefined);
        e.preventDefault();
        var email = emailInput.value;
        var password = passwordInput.value;
        var serverUrl = serverInput.value;
        Meteor.loginWithGitlabAccount(email, password, serverUrl, function (error) {
            if (error) {
                Session.set('loginErrorMessage', error.reason);
            } else {
                Router.go('home');
            }
        });
    },

};