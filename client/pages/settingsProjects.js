Template.settingsProjects.events({
    'click .btn.activateProject': function (e) {
        console.log('act');
        Projects.update(this._id, {
            $set: {
                enabled: true
            }
        });
    },
    'click .btn.deactivateProject': function (e) {
        console.log('deact');
        Projects.update(this._id, {
            $set: {
                enabled: false
            }
        });
    }
});