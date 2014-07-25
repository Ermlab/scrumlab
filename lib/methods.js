Meteor.methods({
    'refreshUserProjects': function (e) {
        if (!this.isSimulation) {
            Server.refreshUserProjects();
        }
    },

    'createIssue': function (issueProp) {
        if (!this.isSimulation) {
            Server.createIssue(issueProp);
        }
        
        return 5;
        
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