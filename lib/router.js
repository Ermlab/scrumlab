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
        return Meteor.subscribe('userProjects');
    },

});


Router.map(function () {
    this.route('home', {
        path: '/',
        data: function () {
            return {};
        },
        onAfterAction: function () {
            document.title = 'Dashboard - Scrumlab';
        },
    });

    this.route('projectDashboard', {
        path: '/project/:id/dashboard',
        data: function () {
            var project = Projects.findOne(this.params.id);
            return {
                project: project
            };
        },
    });

    this.route('projectBacklog', {
        path: '/project/:id/backlog',
        waitOn: function () {
            return [Meteor.subscribe('issues', this.params.id)];
        },
        data: function () {
            var project = Projects.findOne(this.params.id);
            return {
                project: project,
                issues: Issues.find({
                    'project_id': project._id
                }, {
                    sort: {
                        position: 1
                    }
                }),
                projectId: project._id
            };
        },
    });

    this.route('projectSprints', {
        path: '/project/:id/sprints',

        waitOn: function () {
            return [Meteor.subscribe('sprints', this.params.id), Meteor.subscribe('issues', this.params.id)];
        },
        data: function () {
            var project = Projects.findOne(this.params.id);
            return {
                project: project,
                sprints: Sprints.find({
                    'project_id': project._id
                }, {
                    sort: {
                        position: 1
                    }
                }),
                issues: Issues.find({
                    sprint: {
                        "$exists": false
                    },
                    'project_id': project._id
                }, {
                    sort: {
                        position: 1
                    }
                })
            };
        },
    });

    this.route('settingsProjects', {
        path: '/projects-settings',
        onBeforeAction: function () {
            Meteor.call('refreshUserProjects');
        },
        data: function () {
            return {
                projects: Projects.find({
                    member_ids: Meteor.userId()
                })
            };
        },
        onAfterAction: function () {
            document.title = 'Projects Settings - Scrumlab';
        },
    });

    /*this.route('project', {
        path: '/project/:id',
        onBeforeAction: function () {
            this.redirect('projectDashboard', {
                id: this.params.id
            });
        }
    });*/

    this.route('about', {
        path: '/about',
        data: function () {
            return {};
        },
        onAfterAction: function () {
            document.title = 'About - Scrumlab';
        },
    });

});