Template.projectsSettings.events({
    'click .btn.activateProject': function (e) {
        Projects.update(this._id, {
            $set: {
                active: true
            }
        });
    },
    'click .btn.deactivateProject': function (e) {
        Projects.update(this._id, {
            $set: {
                active: false
            }
        });
    }
});

Template.projectsSettings.projects = function () {
    return Projects.find();
};