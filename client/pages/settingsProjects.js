Template.settingsProjects.events({
    'click .btn-sm.activateProject': function (e) {
        Projects.update(this._id, {
            $set: {
                enabled: true
            }
        });
    },
    'click .btn-sm.deactivateProject': function (e) {
        Projects.update(this._id, {
            $set: {
                enabled: false
            }
        });
    }
});

Template.settingsProjects.projects = function () {
    return Projects.find();
};
