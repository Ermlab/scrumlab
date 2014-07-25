Meteor.methods({
    'refreshUserProjects': function (e) {
        if (!this.isSimulation) {
            Server.refreshUserProjects();
        }
    },

    'insertIssue': function (issueProp) {
        if (!this.isSimulation) {
            Server.createIssue(issueProp);
        }
    },
    
    'editIssue': function (updateObject) {
        if (!this.isSimulation) {
            Server.editIssue(updateObject);
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