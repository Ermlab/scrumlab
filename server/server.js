/*--- require sections --*/
var Fiber = Npm.require('fibers');
var Future = Npm.require('fibers/future');







// Serverside functions
Server = {
    getGitlabApi: function (options) {
        if (options.origin === undefined) {
            throw new Error("Origin is not defined");
        }

        return new GitLab(options);
    },

    createIssue: function (issue) {
        // Create issue at GitLab server
        /*
        id (required) - The ID of a project
        title (required) - The title of an issue
        description (optional) - The description of an issue
        assignee_id (optional) - The ID of a user to assign issue
        milestone_id (optional) - The ID of a milestone to assign issue
        labels (optional) - Comma-separated label names for an issue
        */
        var user = Meteor.user();
        if (!user) {
            return;
        }
        var server = GitlabServers.findOne(user.origin);
        var api = Server.getGitlabApi({
            url: server.url,
            token: user.token,
            origin: server._id
        });
        gitlabIssue = {
            'id': issue.gitlab_project_id,
            'title': issue.title,
            'description': issue.description,
            'assignee_id': issue.assignee_id
        };
        /*
        var link = "http://gitlab.ermlab.com/api/v3/projects/" + issue.gitlab_project_id + "/issues?private_token=" + user.token;
        result = HTTP.post(
            link, {
                params: gitlabIssue
            });
            */
        // Not working?
        api.issues.create(issue.gitlab_project_id, gitlabIssue);
    },

    refreshUserProjects: function () {
        var user = Meteor.user();

        if (!user) {
            return;
        }

        var server = GitlabServers.findOne(user.origin);
        var api = Server.getGitlabApi({
            url: server.url,
            token: user.token,
            origin: server._id
        });

        //we fetch user projects, and execute callback
        Server.fetchProjects(api, function (ids) {

            console.log('ref proj:', ids);

            Meteor.users.update(user._id, {
                $set: {
                    project_ids: ids
                }
            });


            _.each(ids, function (id) {
                // TODO: refactor, issues should be fetched when project is activated
                Server.fetchProjectIssues(api, id);
                Server.fetchProjectMembers(api, id);
                Server.fetchProjectMilestones(api, id);
            });
        });
    },

    fetchUsers: function (api) {
        // Fetch all users from Gitlab server
        api.users.all(function (users) {
            Fiber(function () {

                for (var i = 0; i < users.length; i++) {
                    // Check if user already exists, then update or insert
                    var existingUser = Meteor.users.findOne({
                        'gitlab.id': users[i].id,
                        'origin': api.options.origin
                    });

                    if (existingUser !== undefined) {
                        Meteor.users.update(existingUser._id, {
                            $set: {
                                'username': users[i].username,
                                'gitlab': users[i],
                            }
                        });
                    } else {
                        Meteor.users.insert({
                            'username': users[i].username,
                            'gitlab': users[i],
                            'origin': api.options.origin
                        });
                    }
                }
            }).run();
        });
    },

    // Fetch all projects for authenticated (by private_token) api user from Gitlab server
    fetchProjects: function (api, callback) {

        api.projects.all(function (projects) {
            var allProjectIds = [];
            Fiber(function () {
                for (var i = 0; i < projects.length; i++) {
                    // Check if project already exists, then update or insert
                    var existingProject = Projects.findOne({
                        'gitlab.id': projects[i].id,
                        'origin': api.options.origin
                    });

                    var projectId;

                    //todo: refactor to update with upsert parameter
                    if (existingProject !== undefined) {
                        Projects.update(existingProject._id, {
                            $set: {
                                'gitlab': projects[i]
                            }
                        });
                        projectId = existingProject._id;
                    } else {
                        projectId = Projects.insert({
                            'gitlab': projects[i],
                            'origin': api.options.origin
                        });
                    }

                    allProjectIds.push(projectId);
                }
                if (callback) {
                    callback(allProjectIds);
                }
            }).run();
            console.log('fetchProjects ended');
        });
    },

    fetchUserIssues: function (api) {
        // Fetch all user issues from Gitlab server
        api.issues.all(function (issues) {
            Fiber(function () {
                for (var i = 0; i < issues.length; i++) {
                    // Check if issue already exists, then update or insert
                    var existingIssue = Issues.findOne({
                        'gitlab.id': issues[i].id,
                        'origin': api.options.origin
                    });

                    if (existingIssue !== undefined) {
                        Issues.update(existingIssue._id, {
                            $set: {
                                'gitlab': issues[i]
                            }
                        });
                    } else {
                        Issues.insert({
                            // TODO: nie wiemy z jakiego projektu jest to issue
                            // 'project_id': ??????
                            // Trzeba pobrac projekt na podstawie id i origin, a potem jego id
                            'gitlab': issues[i],
                            'origin': api.options.origin
                        });
                    }
                }
            }).run();
        });
    },

    fetchProjectIssues: function (api, projectId) {
        var project = Projects.findOne(projectId);

        // Fetch all project issues from Gitlab server
        api.projects.issues.list(project.gitlab.id, {}, function (issues) {
            Fiber(function () {

                for (var i = 0; i < issues.length; i++) {
                    // Check if issue already exists, then update or insert
                    var existingIssue = Issues.findOne({
                        'gitlab.id': issues[i].id,
                        'origin': api.options.origin
                    });

                    if (existingIssue !== undefined) {
                        Issues.update(existingIssue._id, {
                            $set: {
                                'gitlab': issues[i]
                            }
                        });
                    } else {
                        Issues.insert({
                            'project_id': projectId,
                            'gitlab': issues[i],
                            'origin': api.options.origin
                        });
                    }
                }
            }).run();
        });
    },

    fetchProjectMilestones: function (api, projectId) {
        var project = Projects.findOne(projectId);

        // Fetch all project issues from Gitlab server
        api.projects.milestones.list(project.gitlab.id, function (milestones) {
            Fiber(function () {
                for (var i = 0; i < milestones.length; i++) {
                    // Check if issue already exists, then update or insert
                    var existingSprint = Sprints.findOne({
                        'gitlab.id': milestones[i].id,
                        'origin': api.options.origin
                    });

                    if (existingSprint !== undefined) {
                        Sprints.update(existingSprint._id, {
                            $set: {
                                'gitlab': milestones[i]
                            }
                        });
                    } else {
                        Sprints.insert({
                            'project_id': projectId,
                            'gitlab': milestones[i],
                            'origin': api.options.origin
                        });
                    }
                }
            }).run();
        });
    },

    fetchProjectMembers: function (api, projectId) {
        var project = Projects.findOne(projectId);

        if (!project)
            throw new Error("Project with id=" + projectId + " not exists, so I cant find its members");

        api.projects.members.list(project.gitlab.id, function (members) {

            //async code which updates collections have to run in Fiber
            Fiber(function () {

                //choose from the array of objects (members) only member id (gitlab id)
                var usersGlIds = _.pluck(members, 'id');


                //update project collection, add members id to member_ids array

                var usersMongoIds = Meteor.users.find({
                    'gitlab.id': {
                        $in: usersGlIds
                    },
                    'origin': project.origin
                }, {
                    fields: {
                        'origin': 1
                    }
                }).fetch();

                //choose from the array of objects (users) only mongo user id
                usersMongoIds = _.pluck(usersMongoIds, '_id');

                Projects.update(project._id, {
                    $set: {
                        'member_ids': usersMongoIds
                    }
                });

                console.log('mongo---', usersMongoIds);
            }).run();

        }); //end api

    } //end func
};

Meteor.startup(function () {
    // Fixtures 
    if (GitlabServers.find().count() === 0) {
        GitlabServers.insert({
            url: 'http://gitlab.ermlab.com/',
            token: '7d1dByE7ecRyBHKhieWR'
        });
    }

    // Fetch data from all servers
    _.each(GitlabServers.find().fetch(), function (server) {
        server.origin = server._id;
        var api = Server.getGitlabApi(server);
        Server.fetchUsers(api);
        //Server.fetchProjects(api);
    });
});

Accounts.registerLoginHandler(function (loginRequest) {
    // Use first available server if not specified in login request
    if (loginRequest.gitlabServerId === undefined) {
        loginRequest.gitlabServerId = GitlabServers.findOne()._id;
    }

    var server = GitlabServers.findOne(loginRequest.gitlabServerId);

    // Authorize user and update its profile
    var future = new Future();

    server.origin = server._id;
    var api = Server.getGitlabApi(server);
    api.users.session(loginRequest.email, loginRequest.password, function (data) {
        future.return(data);
    });
    var userData = future.wait();


    if (userData === true) {
        // TODO: Gitlab auth failes
    } else {
        // Gitlab auth successful
        var existingUser = Meteor.users.findOne({
            'gitlab.username': userData.username,
            'origin': server._id
        });

        if (existingUser) {
            userId = existingUser._id;
            Meteor.users.update({
                _id: userId
            }, {
                $set: {
                    username: userData.username,
                    gitlab: userData,
                    token: userData.private_token
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
        }
    }
});

Accounts.onLogin(function (data) {
    /*

    var user = data.user;

    // get all projects available for current user
    var projectsFuture = new Future();

    //majac usera, znajde jego origin, origin = id servera

    var server = GitlabServers.findOne(user.origin);
    Server.getGitlabApi({
        url: server.url,
        token: user.token
    }).projects.all(function (projects) {
        console.log(projects);
        projectsFuture.return(projects);
    });

    var projects = projectsFuture.wait();


    console.log('from gitlab');
    console.log(projects);


    console.log('user ');
    console.log(user);

    var in_projects = [];

    for (var i = 0; i < projects.length; i++) {
        in_projects.push(projects[i].id);


        //update projects members field
        //find project and update its members property



        var search = {
            'gitlab.id': projects[i].id,
            'origin': user.origin
        };

        console.log(search);

        var proj = Projects.findOne(search);


        Projects.update(proj._id, {
            $addToSet: {
                member_ids: user._id
            }
        });

        //update user in_projects field
        Meteor.users.update({
            _id: user._id
        }, {
            $addToSet: {
                project_ids: proj._id
            }
        });
        


    }
    */


});