// Router must be defined in a file common to the client and server so both contexts can use them.

Router.configure({
    //debug: true,
    before: function () {
        //console.log('before all');
    },
    loadingTemplate: 'loading',
    layoutTemplate: 'masterLayout',

    //subscribtion of projects name
    waitOn: function () {
        //return Meteor.subscribe('projectNames');
        return Meteor.subscribe('userProjects');
    },
    /* data: function () {
        return {
            projectNames: Projects.find({}, {
                fields: {
                    'gitlab.id': 1,
                    'gitlab.name': 1,
                    'gitlab.name_with_namespace': 1
                }
            })
        }
    },
*/
});


Router.map(function () {
    this.route('dashboard', {
        path: '/',
        data: function () {
            return {};
        },
        onAfterAction: function () {
            document.title = 'Dashboard - Scrumlab';
        },
    });

    this.route('projectDashboard', {
        path: '/project/:gitlabId/dashboard',
        data: function () {
            var project = Projects.findOne({
                'gitlab.id': Number(this.params.gitlabId)
            });
            return {
                project: project
            };
        },
    });
    this.route('projectBacklog', {
        path: '/project/:gitlabId/backlog',
        data: function () {
            var project = Projects.findOne({
                'gitlab.id': Number(this.params.gitlabId)
            });
            return {
                project: project,
                issues: Issues.find({
                    'gitlab.project_id': Number(this.params.gitlabId)
                }, {
                    sort: {
                        position: 1
                    }
                })
            };
        },
    });
    
    this.route('projectSprints', {
        path: '/project/:gitlabId/sprints',
        data: function () {
            var project = Projects.findOne({
                'gitlab.id': Number(this.params.gitlabId)
            });
            return {
                project: project
            };
        },
    });
    
    this.route('projectsSettings', {
        path: '/projects-settings',
        waitOn: function () {
            return Meteor.subscribe('userProjects');
        },
        data: function () {
            return {
                projects: Projects.find({
                    members_id: Meteor.userId()
                })
            };
        },
        onAfterAction: function () {
            document.title = 'Projects Settings - Srumlab';
        },
    });
    
    this.route('project', {
        path: '/project/:gitlabId',
        onBeforeAction: function () {
            this.redirect('projectDashboard', {
                gitlabId: this.params.gitlabId
            });
        }
    });
    
    this.route('about', {
        path: '/about',
        data: function () {
            return {};
        },
        onAfterAction: function () {
            document.title = 'About - Scrumlab';
        },
    });

    // temporary routes for backlog and sprints
    this.route('backlog', {
        path: '/backlog',
        data: function () {
            return {};
        },
        onAfterAction: function () {
            document.title = 'Backlog - Scrumlab';
        },
    });
    
    this.route('sprints', {
        path: '/sprints',
        data: function () {
            return {};
        },
        onAfterAction: function () {
            document.title = 'Sprints - Scrumlab';
        },
    });
});