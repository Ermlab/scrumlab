// Router must be defined in a file common to the client and server so both contexts can use them.

Router.configure({
    //debug: true,
    before: function () {
        //console.log('before all');
    },
    loadingTemplate: 'loading'

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
        layoutTemplate: 'masterLayout'

    });
    this.route('project', {
        path: '/project/:gitlabId',
        onBeforeAction: function () {
            this.redirect('projectDashboard', {
                gitlabId: this.params.gitlabId
            });
        }
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
        layoutTemplate: 'masterLayout'
    });
    this.route('projectBacklog', {
        path: '/project/:gitlabId/backlog',
        data: function () {
            var project = Projects.findOne({
                'gitlab.id': Number(this.params.gitlabId)
            });
            return {
                project: project

            };
        },
        layoutTemplate: 'masterLayout'
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
        layoutTemplate: 'masterLayout'
    });
    this.route('projectsSettings', {
        path: '/projects-settings',
        data: function () {
            return {
                projects: Projects.find()
            };
        },
        onAfterAction: function () {
            document.title = 'Projects Settings - Srumlab';
        },
        layoutTemplate: 'masterLayout'
    });
    this.route('about', {
        path: '/about',
        data: function () {
            return {};
        },
        onAfterAction: function () {
            document.title = 'About - Scrumlab';
        },
        layoutTemplate: 'masterLayout'
    });
    this.route('backlog', {
        path: '/backlog',
        data: function () {
            return {};
        },
        onAfterAction: function () {
            document.title = 'Backlog - Scrumlab';
        },
        layoutTemplate: 'masterLayout'
    });
        this.route('sprints', {
        path: '/sprints',
        data: function () {
            return {};
        },
        onAfterAction: function () {
            document.title = 'Sprints - Scrumlab';
        },
        layoutTemplate: 'masterLayout'
    });
});