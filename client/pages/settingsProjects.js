Template.settingsProjects.events({
    'click .btn.activateProject': function (e) {
        console.log('act');
        console.log(this);
        Projects.update(this._id, {
            $set: {
                enabled: true
            }
        });
    },
    'click .btn.deactivateProject': function (e) {
        console.log('deact');
        console.log(this);
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
