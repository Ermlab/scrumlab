var Fiber = Npm.require('fibers');
var Future = Npm.require('fibers/future');


Accounts.registerLoginHandler(function (loginRequest) {

    var url = loginRequest.gitlabServerUrl;
    if (url.indexOf('http://') == -1 && url.indexOf('https://') == -1) {
        throw new Meteor.Error(403, "Gitlab server must start with http: // or https://");
    }

    if (url.substr(url.length - 1) == '/') {
        loginRequest.gitlabServerUrl = url.substr(0, url.length - 1);
    }

    // Search for existing GitLab server
    var server = GitlabServers.findOne({
        'url': loginRequest.gitlabServerUrl
    });


    // If server was found use existing server to authorize user
    if (server) {

        // Get server info from database
        server.origin = server._id;

        // Create GitLab api
        var api = Server.getGitlabApi(server);

        // Create user session
        var future = new Future();
        api.users.session(loginRequest.email, loginRequest.password, function (data) {
            future.return(data);
        });
        // Wait for data
        var userData = future.wait();

        console.log('got user data from logging to existing server', userData);

        if (userData === true) {
            // Gitlab auth failed
            throw new Meteor.Error(401, "Authentication failed");
        } else {
            // Gitlab auth successful
            var existingUser = Meteor.users.findOne({
                'gitlab.username': userData.username,
                'origin': server._id
            });

            var userId = null;

            if (existingUser) {
                userId = existingUser._id;

                //we merged the gitlab fields with those in existing user
                var usrUpdated = _.extend(existingUser.gitlab, userData);
                Meteor.users.update(existingUser._id, {
                    $set: {
                        username: userData.username + '@' + server._id,
                        token: userData.private_token,
                        gitlab: userData,
                    }
                });

            } else {
                userId = Meteor.users.insert({
                    username: userData.username + '@' + server._id,
                    gitlab: userData,
                    token: userData.private_token,
                    origin: server._id
                });
            }

            // return id user to log in
            if (userId !== null) {
                return {
                    userId: userId,
                };
            }
        }
    }
    // If no server found : verify and add new gitlab server
    else {
        console.log("new server");
        // Get user's private token
        var result = Server.getPrivateToken(loginRequest);
        console.log('login result', result);
        if (result.error) {
            throw new Meteor.Error(result.error.code, result.error.message);
        }

        var privateToken = result.data.private_token;
        if (!privateToken) {
            throw new Meteor.Error(401, "Token not received");
        }

        // If token was received, save server in database
        else {
            console.log('Private token received: ' + privateToken);
            // Insert server info and use it to create api
            var server = {
                url: loginRequest.gitlabServerUrl,
                token: privateToken,
                origin: GitlabServers.insert({
                    url: loginRequest.gitlabServerUrl
                })
            };
            // Create GitLab api
            var api = Server.getGitlabApi(server);

            // Create user session and wait for data
            var future = new Future();
            api.users.session(loginRequest.email, loginRequest.password, function (data) {
                future.return(data);
            });
            var userData = future.wait();

            if (userData === true) {
                throw new Meteor.Error(401, "No user data from server, check your login and password");
            } else {
                // Gitlab auth successful
                var existingUser = Meteor.users.findOne({
                    'gitlab.username': userData.username,
                    'origin': server._id
                });

                var userId = null;

                if (existingUser) {
                    userId = existingUser._id;

                    //we merged the gitlab fields with those in existing user
                    var usrUpdated = _.extend(existingUser.gitlab, userData);
                    Meteor.users.update(existingUser._id, {
                        $set: {
                            username: userData.username,
                            token: userData.private_token,
                            gitlab: usrUpdated,
                        }
                    });

                } else {
                    userId = Meteor.users.insert({
                        username: userData.username,
                        gitlab: userData,
                        origin: server._id,
                        token: userData.private_token
                    });
                }

                // return id user to log in
                if (userId !== null) {
                    return {
                        userId: userId,
                    };
                } else {
                    throw new Meteor.Error(401, "Something bad happened");
                }
            }
        }
    };
});

Accounts.onLogin(function (data) {

});