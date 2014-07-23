/*--- publish section ---*/

//publish user data in order to have access to gitlab user data
Meteor.publish("userData", function () {
    if (this.userId) {
        return Meteor.users.find({
            _id: this.userId
        }, {
            fields: {
                'gitlab': 1
            }
        });
    } else {
        this.ready();
    }
});


//TODO: it should return only logged user projects
Meteor.publish('userProjects', function () {

    if (this.userId) {

        return Projects.find({
            member_ids: this.userId
        });
    } else
        return null;
});



Meteor.publish('sprints', function (projectId) {
    return Sprints.find(projectId);
});




Meteor.publish('issues', function (projectId) {
    return Issues.find(projectId);
});

