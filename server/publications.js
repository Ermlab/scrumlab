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

Meteor.publish('members', function (projectId) {

    var project = Projects.findOne(projectId);
    if (project) {
        var members = [];
        for (var i = 0; i < project.member_ids.length; i++) {
            members.push(project.member_ids[i].id);
        }
    }
    if (_.contains(members, this.userId)) {
        return Meteor.users.find({
            '_id': {
                $in: members
            }
        }, {
            fields: {
                gitlab: 1
            }
        });


    }
});

//TODO: it should return only logged user projects
Meteor.publish('userProjects', function () {
    if (this.userId) {
        return Projects.find({
            'member_ids.id': this.userId
        });
    } else
        return null;
});

Meteor.publish('sprints', function (projectId) {
    return Sprints.find({
            'project_id': projectId
        }
    );
});

Meteor.publish('issues', function (projectId) {
    return Issues.find({
        'project_id': projectId
    });
});

Meteor.publish('tasks', function (projectId) {
    return Tasks.find({
        'project_id': projectId
    });
});

Meteor.publish('gitlabServers', function () {
    return GitlabServers.find();
});