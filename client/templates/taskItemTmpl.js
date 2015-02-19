var estimationOptions = function (task) {
    return {
        collection: Tasks,
        id: task._id,
        field: 'estimation',
        type: 'text',
        title: 'Task estimation',
        value: task.estimation,
        emptytext: 'N/A',
        container: 'body',
        validate: function (value) {
            if (isNaN(parseFloat(value))) {
                return "Number is required";
            }
        }
    };
}

var nameOptions = function (task) {
    return {
        collection: Tasks,
        id: task._id,
        field: 'name',
        type: 'text',
        title: 'Task name',
        value: task.name,
        container: 'body',
    };
}



Template.taskItemTmpl.helpers({
    statusCheck: function (status, input) {
        if (status == input) return true;
        else return false;
    },

    estimationOptions: function () {
        return estimationOptions(this);
    },

    nameOptions: function () {
        return nameOptions(this);
    }
});

Template.taskItemTmpl.events = {
    'click .delete-task': function (e) {
        Tasks.remove(this._id);

        // add placeholder task if needed
        if (Tasks.find({
                issue_id: this.issue_id
            }).count() == 0) {
            AddPlaceholderTaskToIssue(this.issue_id);
        }
    },
}


Template.taskItemWorkboard.helpers({
    statusCheck: function (status, input) {
        if (status == input) return true;
        else return false;
    },
    estimationOptions: function () {
        return estimationOptions(this);
    },

    nameOptions: function () {
        return nameOptions(this);
    },
    assigneeOptions: function () {

        var task = this;
        var users = Meteor.users.find().fetch();
        var members = [ /*{id:'', text: 'not assigned'}*/ ];
        for (var i = 0; i < users.length; i++) {
            members.push({
                value: users[i]._id,
                text: users[i].gitlab.username,
                avatarUrl: users[i].gitlab.avatar_url,
            });
        }
        return {
            collection: Tasks,
            id: task._id,
            field: 'assignee',
            type: 'select',
            source: members,
            title: 'Assignee',
            value: task.assignee,
            container: 'body',
            display: function (value, sourceData) {
                if (sourceData) {
                    for (var i = 0; i < sourceData.length; i++) {
                        if (sourceData[i].value == value) {
                            $(this).attr('src', sourceData[i].avatarUrl);
                            $(this).attr('title', sourceData[i].text);
                            return;
                        }
                    }
                }
                $(this).attr('src', "/img/anonymous.png");
                $(this).attr('title', 'unassigned');
            }
        };

    },

    /*    assignee: function () {
            var user = Meteor.users.findOne(this.assignee);
            console.log("this assinggge", this.assignee);
            if (user) {

                return {
                    name: user.gitlab.username,
                    avatarUrl: user.gitlab.avatar_url || "/img/anonymous.png"

                }
            } else {
                return {
                    name: "not assigned",
                    avatarUrl: "/img/anonymous.png"
                }
            }
        },*/

});

Template.taskItemWorkboard.events = {
    'click .delete-task': function (e) {
        Tasks.remove(this._id);

        // add placeholder task if needed
        if (Tasks.find({
                issue_id: this.issue_id
            }).count() == 0) {
            AddPlaceholderTaskToIssue(this.issue_id);
        }
    },
}