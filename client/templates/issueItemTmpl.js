var issueTitleOptions = function (issue) {
    return {
        collection: Issues,
        id: issue._id,
        field: 'gitlab.title',
        type: 'text',
        title: 'Issue title',
        value: issue.gitlab.title,
        container: 'body',
        validate: function (value) {
            if (!value) {
                return "This field is required";
            }
        },
        updated: function (id) {
            Meteor.call('pushIssue', issue.id);
        }
    };
}

var totalEstimation = function (issue) {
    var tasks = Tasks.find({
        issue_id: issue._id
    }).fetch();
    var sum = 0;
    for (var i = 0; i < tasks.length; i++) {
        var n = parseFloat(tasks[i].estimation);
        if (!isNaN(n)) {
            sum += n;
        }
    }
    return sum;
}

var tasks = function (issue) {
    return Tasks.find({
        issue_id: issue._id
    });
}


Template.issueItemTmpl.helpers({
    tasks: function () {
        return tasks(this);
    },

    tasksCount: function () {
        return Tasks.find({
            issue_id: this._id
        }).count();
    },

    totalEstimation: function () {
        return totalEstimation(this);
    },

    titleOptions: function () {
        return issueTitleOptions(this);
    },

    members: function () {
        return Tasks.find({
            issue_id: this._id
        }).count();
    },
});


Template.issueItemWorkboard.helpers({
    tasks: function () {
        return tasks(this);
    },
    titleOptions: function () {
        return issueTitleOptions(this);
    },
    totalEstimation: function () {
        return totalEstimation(this);
    },
    progress: function () {
        var totals = {
            toDo: 0,
            inProgress: 0,
            done: 0
        };

        var tasks = Tasks.find({
            issue_id: this._id
        }).fetch();

        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i].estimation) {
                totals[tasks[i].status] += tasks[i].estimation * 1;
            }
        }
        var total = totals.toDo + totals.inProgress + totals.done;
        
        if (total==0) {
            return;
        }
        
        totals.toDo = Math.round(100 * totals.toDo / total);
        totals.inProgress = Math.round(100 * totals.inProgress / total);
        totals.done = 100 - totals.toDo - totals.inProgress;
        return [{
            status: 'danger',
            percent: totals.toDo
        }, {
            status: 'warning',
            percent: totals.inProgress
        }, {
            status: 'success',
            percent: totals.done
        }];
    }
});