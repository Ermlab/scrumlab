Meteor.methods({
    'refreshUserProjects': function (e) {
        if (!this.isSimulation) {
            Server.refreshUserProjects();
        }
    },

    'refreshProject': function (projectId) {
        if (!this.isSimulation) {
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
        var user = Meteor.user();
        if (!user) {
            return;
        }

        issueProp.created_at = CurrDate();
        issueProp.origin = user.origin;

        if (!this.isSimulation) {
            return Server.createIssue(issueProp);
        }
    },

    'pushIssue': function (issueId, stateEvent) {
        if (!this.isSimulation) {
            Server.pushIssue(issueId, stateEvent);
        }
    },

    'getGitlabServerIds': function (email) {
        if (!this.isSimulation) {
            return Server.getGitlabServerIds(email);
        }
    }
});