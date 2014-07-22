Meteor.methods({
    'refreshUserProjects': function (e) {
        if (!this.isSimulation) {
            Server.refreshUserProjects();
        }
    },

    // an example server function
    'foo': function () {
        if (this.isSimulation) {
            // client code
        }

        if (!this.isSimulation) {
            Server.foo();
        }
    }
});