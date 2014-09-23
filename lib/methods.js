Meteor.methods({
    'refreshUserProjects': function (e) {
        if (!this.isSimulation) {
            Server.refreshUserProjects();
        }
    },

    'refreshProject': function (projectId) {
        if (!this.isSimulation) {
            console.log('refreshing project', projectId);
            return Server.refreshProject(projectId);
        }
    },

    'createSprint': function (doc) {
        var user = Meteor.user();
        if (!user) {
            return;
        }

        if (!this.isSimulation) {
            return Server.createSprint(doc);
        }
    },

    'editSprint': function (doc) {
        var user = Meteor.user();
        if (!user) {
            return;
        }

        if (!this.isSimulation) {
            return Server.editSprint(doc);
        }
    },
    
    'pushSprint': function (id) {
        if (!this.isSimulation) {
            return Server.pushSprint(id);
        }
    },

    'createIssue': function (issueProp) {
        console.log('Both - create Issue', Date.now(), issueProp);
        var user = Meteor.user();
        if (!user) {
            return;
        }
        issueProp.created_at = Date.now();
        issueProp.origin = user.origin;
        if (this.isSimulation) {
            // client code
            //todo: what goes here?, if we add issue on client then what will happen?
            //console.log('create Issue client', Date.now());
            //return Client.createIssue(issueProp);
        }
        if (!this.isSimulation) {
            console.log('create Issue server', Date.now());
            return Server.createIssue(issueProp);
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
    },

    'synchronizingIssues': function (respIncome) {
        // Do something here
    },

    'getGitlabServerIds': function (email) {
        if (!this.isSimulation) {
            return Server.getGitlabServerIds(email);
        }
    }
});