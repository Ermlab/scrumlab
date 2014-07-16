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
});