Template.navProjectsList.anyProjectIsEnabled = function () {
    return Projects.find({
            enabled: true
        }).count() > 0;
};

Template.navProjectsList.projectNames = function () {
    //TODO: refactor, fields are not needed on the client side (PG)
    return Projects.find({'member_ids.id': Meteor.userId()}, {
        fields: {
            '_id': 1,
            'gitlab.name': 1,
            'gitlab.name_with_namespace': 1,
            'enabled': 1
        }
    });

};
Session.set("activeProject", null);

Template.navProjectsList.anyProjectIsActive = function () {
    if (Session.get("activeProject") != null && Projects.find({
            enabled: true
        }).count() > 0) {
        return true;
    } else {
        Session.set("activeProject", null);
        return false;
    }
};
Template.navProjectsList.activeProject = function () {
    return Session.get("activeProject");
};

Template.navProjectsList.events = {
    'click .projectName': function () {
        Session.set("activeProject", this.gitlab.name_with_namespace);
    }
};

