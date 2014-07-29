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

        //TODO:permissions, who can create new stories?
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


        var projectId = issue.project_id;
        gitlabIssue = {
            'id': issue.gitlabProjectId, //id of a gitlab project!
            'title': issue.title,
            'description': issue.description,
            'assignee_id': issue.assignee_id,
            'labels': 'story'
        };


        api.issues.create(issue.gitlabProjectId, gitlabIssue, function (glIssue) {
            Fiber(function () {
                console.log("After creation of issue", glIssue);


                /* var new_issue = {
                    'project_id': projectId, //mongo project_id
                    'gitlab': glIssue,
                    'origin': api.options.origin,
                    'estimation': issue.
                    'created_at': issue.created_at
                };*/


                var new_issue = BuildAnIssue(issue, glIssue);

                console.log('issue on server \n', new_issue);

                return Issues.insert(new_issue);

            }).run(); //end fiber

        }); //end api.issue.create

    }, //end issue create

    editIssue: function (updateObject) {
        // Edit issue at GitLab server
        /*
        id (required) - The ID of a project
        issue_id (required) - The ID of a project's issue
        title (optional) - The title of an issue
        description (optional) - The description of an issue
        assignee_id (optional) - The ID of a user to assign issue
        milestone_id (optional) - The ID of a milestone to assign issue
        labels (optional) - Comma-separated label names for an issue
        state_event (optional) - The state event of an issue ('close' to close issue and 'reopen' to reopen it)
        */
        var user = Meteor.user();
        if (!user) {
            return;
        }
        console.dir(updateObject);
        var server = GitlabServers.findOne(user.origin);
        var api = Server.getGitlabApi({
            url: server.url,
            token: user.token,
            origin: server._id
        });
        api.issues.edit(updateObject.id, updateObject.issue_id, updateObject, function (data) {

            console.log("After editing issue", data);



        });
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

                        /* console.log("!!! Existing\n",existingUser.gitlab);                    
                        console.log("from gitlab \n",users[i]);*/


                        //we extends existed user by the new information which comes from gitlab
                        //the fields in existing user are overwritten by the gitlab users[i], fields
                        //that didn't appear in gitlab user object stays untouch
                        var usrUpdated = _.extend(existingUser.gitlab, users[i]);

                        //console.log("merged \n",usrUpdated);

                        Meteor.users.update(existingUser._id, {
                            $set: {
                                'username': users[i].username,
                                'gitlab': usrUpdated,
                            }
                        });

                        //todo: gitlab object is overwritten, possible data loss!
                        //use _.extend method form underscore.js
                        /*Meteor.users.update(existingUser._id, {
                            $set: {
                                'username': users[i].username,
                                'gitlab': users[i],
                            }
                        });*/

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

                    var projectId = null;

                    //todo: refactor to update with upsert parameter
                    if (existingProject !== undefined) {

                        //todo: better way for dealing with updates
                        var projUpdated = _.extend(existingProject.gitlab, projects[i]);
                        Projects.update(existingProject._id, {
                            $set: {
                                'gitlab': projUpdated,
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

        });
    },

    fetchUserIssues: function (api) {
        // Fetch all user issues from Gitlab server
        api.issues.all(function (issues) {
            Fiber(function () {

                //todo: the same logic as in fetchProjectIssues
                for (var i = 0; i < issues.length; i++) {
                    // Check if issue already exists, then update or insert
                    var existingIssue = Issues.findOne({
                        'gitlab.id': issues[i].id,
                        'origin': api.options.origin
                    });

                    if (existingIssue !== undefined) {


                        var issueUpdated = _.extend(existingIssue.gitlab, issues[i]);

                        Issues.update(existingIssue._id, {
                            $set: {
                                'gitlab': issueUpdated
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

                //todo: the same logic as in fetchUserIssues

                for (var i = 0; i < issues.length; i++) {
                    // Check if issue already exists, then update or insert
                    var existingIssue = Issues.findOne({
                        'gitlab.id': issues[i].id,
                        'origin': api.options.origin
                    });

                    if (existingIssue !== undefined) {

                        var issueUpdated = _.extend(existingIssue.gitlab, issues[i]);

                        Issues.update(existingIssue._id, {
                            $set: {
                                'gitlab': issueUpdated
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


    // Set schedule to check if sprint has ended
    // Schedule to fire every day at 1:00 am
    // parser.text('at 1:00 am');
    // Schedule to fire every 10 seconds
    // parser.recur().every(10).second();
    SyncedCron.add({
        name: 'Sprint ending schedule',
        schedule: function (parser) {
            // parser is a later.parse object
            return parser.text('at 1:00 am');
        },
        job: function () {
            var sprints = Sprints.find({
                status: 'in progress'
            }).fetch();
            _.each(sprints, function (spr) {
                if (CheckDate(spr.endDate) == false) {
                    Sprints.update(spr._id, {
                        $set: {
                            'status': 'finished'
                        }
                    });
                }
            });
        }
    });
    SyncedCron.start();
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
        }
    }
});

Accounts.onLogin(function (data) {

});