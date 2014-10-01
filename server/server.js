/*--- require sections --*/
var Fiber = Npm.require('fibers');
var Future = Npm.require('fibers/future');






// Serverside functions
Server = {
    getGitlabApi: function (options) {
        if (options.origin === undefined) {
            throw new Error("Origin is not defined");
        }
        if (options.token === undefined) {
            options.token = 'none';
        }
        return new GitLab(options);
    },

    getUserApi: function (user) {
        var server = GitlabServers.findOne(user.origin);
        var api = Server.getGitlabApi({
            url: server.url,
            token: user.token,
            origin: server._id
        });
        return api;
    },

    getPrivateToken: function (options) {
        var future = new Future();
        var postUrl = options.gitlabServerUrl + '/api/v3/session';
        var postObject = {
            params: {
                'email': options.email,
                'password': options.password
            }
        };
        HTTP.post(postUrl, postObject, function (error, result) {
            if (error) {
                if (error.code) {
                    future.return({
                        error: {
                            code: error.code,
                            message: "Ooops, auth failed (error " + error.code + ")"
                        }
                    });
                    return;
                }
            }
            if (result) {
                // authenticated
                if (result.data && result.data.private_token) {
                    future.return({
                        data: result.data
                    });
                } else {
                    // something went wrong
                    future.return({
                        error: {
                            code: result.statusCode,
                            message: result.statusCode == 401 ? "Incorrect login or password" : "Ooops, auth failed (error " + result.statusCode + ")"
                        }
                    });
                }
            }
        });
        return future.wait();
    },

    createSprint: function (doc) {
        // Create the milestone
        try {
            var user = Meteor.user();
            if (user === undefined || user.origin != doc.origin) {
                return new Meteor.Error(403, "Access denied.");
            }

            // TODO: refactor doc.projectId to doc.project_id in template?
            var project = Projects.findOne(doc.projectId);

            var server = GitlabServers.findOne(user.origin);
            var api = Server.getGitlabApi({
                url: server.url,
                token: user.token,
                origin: server._id
            });

            var future = new Future();
            logger.debug("Calling api.projects.milestones.add @", server.url);
            api.projects.milestones.add(project.gitlab.id, doc['gitlab.title'], doc['gitlab.description'], doc['gitlab.due_date'], function (milestone) {
                Fiber(function () {
                    doc.gitlab = milestone;
                    doc.project_id = doc.projectId;
                    delete doc.projectId;
                    delete doc['gitlab.title'];
                    delete doc['gitlab.description'];
                    delete doc['gitlab.due_date'];

                    logger.debug('milestone added', milestone, doc);
                    var id = Sprints.insert(doc);
                    logger.debug("New sprint added with id", id);
                    future.return(id);
                }).run();
            });
            return future.wait();
        } catch (err) {
            logger.error(err.message);
            return new Meteor.Error(500, err.message);
        }
    },

    // Updates Gitlab milestone according to document in Meteor
    pushSprint: function (id) {
        try {
            doc = Sprints.findOne(id);
            logger.info("[milestone^] {0}".format(doc.gitlab.title));
            var user = Meteor.user();
            if (user === undefined || user.origin != doc.origin) {
                return new Meteor.Error(403, "Access denied.");
            }
            var project = Projects.findOne(doc.project_id);
            var api = Server.getUserApi(user);
            var state = 'activate';
            if (doc.status && (doc.status == 'aborted' || doc.status == 'completed')) {
                state = 'close';
            }
            api.projects.milestones.update(project.gitlab.id, doc.gitlab.id, doc.gitlab.title, doc.gitlab.description, doc.gitlab.due_date, state);
        } catch (err) {
            logger.error(err.message);
            return new Meteor.Error(500, err.message);
        }
    },

    createIssue: function (issue) {
        logger.info("Creating issue", issue);
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
        
        if (issue.sprint) {
            var sprint = Sprints.findOne(issue.sprint);
            if (sprint) {
                console.log('creating issue in sprint', sprint);
                gitlabIssue.milestone_id = sprint.gitlab.id;
            }
        }


        api.issues.create(issue.gitlabProjectId, gitlabIssue, function (glIssue) {
            Fiber(function () {
                logger.info("Gitlab server created issue", glIssue);

                var new_issue = BuildAnIssue(issue, glIssue);

                logger.info("Inserting issue to Mongo", new_issue);

                var issueId = Issues.insert(new_issue);
                AddPlaceholderTaskToIssue(issueId);

                return issueId;

            }).run(); //end fiber

        }); //end api.issue.create

    }, //end issue create

    pushIssue: function (id, stateEvent) {
        try {
            doc = Issues.findOne(id);
            logger.info("[issue^] {0}".format(doc.gitlab.title));
            var user = Meteor.user();
            if (user === undefined || user.origin != doc.origin) {
                return new Meteor.Error(403, "Access denied.");
            }
            
            var project = Projects.findOne(doc.project_id);
            var api = Server.getUserApi(user);

            var params = {
                title: doc.gitlab.title,
                description: doc.gitlab.description,
                labels: doc.gitlab.labels.join(','), 
                state: doc.gitlab.state
            }
            
            params.assignee_id = 0;
            if (doc.gitlab.assignee && doc.gitlab.assignee.id) {
                params.assignee_id = doc.gitlab.assignee.id;
            }
            
            params.milestone_id = 0;
            if (doc.gitlab.milestone && doc.gitlab.milestone.id) {
                params.milestone_id = doc.gitlab.milestone.id;
            }
            
            if (_.contains(['reopen', 'close'], stateEvent)) {
                params.state_event = stateEvent;                
            }
    
            api.issues.edit(doc.gitlab.project_id, doc.gitlab.id, params);
        } catch (err) {
            logger.error(err);
            return new Meteor.Error(500, err.message);
        }
        
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
        
        logger.info("Editing issue", updateObject);
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
        api.issues.edit(updateObject.id, updateObject.issue_id, updateObject, function (data) {
            logger.info("Gitlab server updated issue", data);
        });
        */
    },

    refreshUserProjects: function () {
        var user = Meteor.user();

        if (!user) {
            return;
        }

        logger.info('Refreshing projects for user', user);

        var server = GitlabServers.findOne(user.origin);
        var api = Server.getGitlabApi({
            url: server.url,
            token: user.token,
            origin: server._id
        });

        //we fetch user projects, and execute callback
        Server.fetchProjects(api, function (ids) {
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

    refreshProject: function (projectId) {
        try {
            var user = Meteor.user();
            var project = Projects.findOne(projectId);

            if (user.origin != project.origin) {
                return new Meteor.Error(403, "Access denied.");
            }

            logger.info("Refreshing project ", project.gitlab.name);
            var server = GitlabServers.findOne(user.origin);
            var api = Server.getGitlabApi({
                url: server.url,
                token: user.token,
                origin: server._id
            });

            Server.fetchProjectIssues(api, projectId);
            Server.fetchProjectMembers(api, projectId);
            Server.fetchProjectMilestones(api, projectId);


        } catch (err) {
            logger.error(err.message);
            return new Meteor.Error(500, err.message);
        }
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

                        //we extend existed user by the new information which comes from gitlab
                        //the fields in existing user are overwritten by the gitlab users[i], fields
                        //that didn't appear in gitlab user object stay untouched
                        var usrUpdated = _.extend(existingUser.gitlab, users[i]);

                        Meteor.users.update(existingUser._id, {
                            $set: {
                                'username': users[i].username,
                                'gitlab': usrUpdated,
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
                logger.info('fetched projects from gitlab server: ' + projects.length);
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

    /*
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
    */

    fetchProjectIssues: function (api, projectId) {
        var project = Projects.findOne(projectId);

        // Fetch all project issues from Gitlab server
        api.projects.issues.list(project.gitlab.id, {}, function (issues) {
            Fiber(function () {
                logger.info("Refreshing {0} issues".format(issues.length));

                //todo: the same logic as in fetchUserIssues
                for (var i = 0; i < issues.length; i++) {
                    // Check if issue already exists, then update or insert
                    var existingIssue = Issues.findOne({
                        'gitlab.id': issues[i].id,
                        'origin': api.options.origin
                    });

                    if (existingIssue !== undefined) {
                        logger.info('[issue*] ' + existingIssue.gitlab.title);

                        var issueUpdated = _.extend(existingIssue.gitlab, issues[i]);

                        Issues.update(existingIssue._id, {
                            $set: {
                                'gitlab': issueUpdated
                            }
                        });

                    } else {
                        logger.info('[issue+] ' + issues[i].title);
                        var output = Issues.insert({
                            'project_id': projectId,
                            'gitlab': issues[i],
                            'origin': api.options.origin,
                            'weight': issues[i].iid
                        });
                        Tasks.insert({
                            'project_id': projectId,
                            'issue_id': output,
                            'name': issues[i].title,
                            'status': 'toDo',
                            'placeholder': true
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
                logger.info("Refreshing {0} milestones".format(milestones.length));
                for (var i = 0; i < milestones.length; i++) {
                    // Check if issue already exists, then update or insert
                    var existingSprint = Sprints.findOne({
                        'gitlab.id': milestones[i].id,
                        'origin': api.options.origin
                    });

                    if (existingSprint !== undefined) {
                        logger.info('[milestone*] ' + existingSprint.gitlab.title);
                        var changes = {
                            gitlab: milestones[i]
                        };
                        
                        // switch to inPlanning status in milestone has been opened in Gitlab
                        if (milestones[i].state == 'active' && _.contains(['completed', 'aborted'], existingSprint.status)) {
                            changes.status = undefined;
                        }

                        // switch to "completed" status if milestone has been closed in Gitlab
                        if (milestones[i].state == 'closed' && _.contains([undefined, 'inPlanning', 'inProgess'], existingSprint.status)) {
                            changes.status = 'completed';
                        }
                        
                        Sprints.update(existingSprint._id, {
                            $set: changes
                        });
                    } else {
                        logger.info('[milestone+] ' + milestones[i].title);
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
            throw new Error("Project with id = " + projectId + " does not exist, so I cant find its members ");
        if (project.gitlab.owner !== undefined) {
            // If project has an owner list of members is taken from project members
            api.projects.members.list(project.gitlab.id, function (members) {

                //async code which updates collections have to run in Fiber
                Fiber(function () {

                    //choose from the array of objects (members) only member id (gitlab id)
                    var usersGlIds = _.pluck(members, 'id');
                    // get members' access levels
                    var userAccessLevels = _.pluck(members, 'access_level');


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
                    // Merge into a table of {id, access_level}
                    var membersIdAccess = [];
                    for (var i = 0; i < usersMongoIds.length; i++) {
                        var obj = {};
                        obj['id'] = usersMongoIds[i];
                        obj['access_level'] = userAccessLevels[i];
                        membersIdAccess.push(obj);
                    }

                    Projects.update(project._id, {
                        $set: {
                            'member_ids': membersIdAccess
                        }
                    });
                }).run();

            }); //end api

        } else {
            // If project has no owner list of members is taken only from the group
            api.groups.listMembers(project.gitlab.namespace.id, function (members) {

                //async code which updates collections have to run in Fiber
                Fiber(function () {
                    //choose from the array of objects (members) only member id (gitlab id)
                    var usersGlIds = _.pluck(members, 'id');
                    // get members' access levels
                    var userAccessLevels = _.pluck(members, 'access_level');

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
                    // Merge into a table of {id, access_level}
                    var membersIdAccess = [];
                    for (var i = 0; i < usersMongoIds.length; i++) {
                        var obj = {};
                        obj['id'] = usersMongoIds[i];
                        obj['access_level'] = userAccessLevels[i];
                        membersIdAccess.push(obj);
                    }

                    Projects.update(project._id, {
                        $set: {
                            'member_ids': membersIdAccess
                        }
                    });
                }).run();

            }); //end api
        }
    }, //end func

    synchronizingIssues: function (respIncome, servInfo) {
        var hookIssue = respIncome.body.object_attributes;

        var finder = Issues.findOne({
            "gitlab.id": hookIssue.id,
            "origin": servInfo._id,
        });

        if (finder === undefined) {
            var proj = Projects.findOne({
                "gitlab.id": hookIssue.project_id,
                "origin": servInfo._id,
            });
            var new_issue = {
                'project_id': proj._id, //mongo project_id
                'origin': servInfo._id,
                'created_at': hookIssue.created_at,
                'gitlab': hookIssue //client and server should update this field
            };

            //mongo issue id
            var issueId = Issues.insert(new_issue);

            // Fetching new issue from GitLab server
            api.issues.show(proj.gitlab.id, new_issue.gitlab.id, function (glIssue) {
                Fiber(function () {
                    var output = Issues.insert({
                        'project_id': proj.gitlab.id,
                        'gitlab': glIssue,
                        'origin': api.options.origin
                    });
                    Tasks.insert({
                        'project_id': proj.gitlab.id,
                        'issue_id': output,
                        'name': glIssue.title,
                        'status': 'toDo',
                        'placeholder': true
                    });
                }).run();
            });

        } else {
            // Updating existing issue
            gitlabObject = finder.gitlab;
            gitlabObject = _.extend(gitlabObject, hookIssue);
            gitlabObject = _.omit(gitlabObject, 'assignee_id', 'author_id', 'branch_name', 'milestone_id');

            Issues.update(
                finder._id, {
                    $set: {
                        'gitlab': gitlabObject,
                    }
                });

            Issues.update({
                _id: finder._id
            }, {
                $addToSet: {
                    'gitlab.labels': {
                        $each: [hookIssue.labels]
                    }
                }
            });
        }
    },

    sprintFinisher: function () {
        var sprints = Sprints.find({
            status: 'in progress'
        }).fetch();
        _.each(sprints, function (spr) {
            if (CheckDate(spr.endDate) === false) {
                Sprints.update(spr._id, {
                    $set: {
                        'status': 'finished',
                        'closedAt': CurrDate
                    }
                });
            }
        });
    },

    getGitlabServerIds: function (email) {
        var users = Meteor.users.find({
            'gitlab.email': email
        }).fetch();
        if (users) {
            var origins = _.pluck(users, 'origin');
            return _.uniq(origins, true);
        }
        return undefined;
    }
};

Meteor.startup(function () {
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
        job: Server.sprintFinisher
    });
    SyncedCron.start();

    // Run sprint finishing 
    Server.sprintFinisher();
});