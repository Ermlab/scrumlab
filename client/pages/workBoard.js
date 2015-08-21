Template.workBoard.rendered = function () {
    Session.set("showAllSprintsInWorkBoard", null);
}

Template.workBoard.startableSprints = function () {
    return Sprints.find({
        $or: [
            {
                status: {
                    $exists: false
                }
            },
            {
                status: 'inPlanning'
            },

        ]
    }, {
        sort: {
            'gitlab.iid': 1
        }
    });
}

Template.workBoard.events({
    'click .start-sprint': function (e) {
        Sprints.update(this._id, {
            $set: {
                status: 'inProgress'
            }
        });
    },
    'click .new-sprint': function (e) {
        Session.set('modal', {
            template: 'modalEditSprint',
            data: this.project._id + ""
        });
    },
    'click .edit-sprint': function (e) {
        Session.set('editSprint', this.sprint.gitlab.iid);
        Session.set('modal', {
            template: 'modalEditSprint',
            data: 'editSprint'
        });
    },
    'click .plan-sprint': function (e) {
        Session.set('rightIssuesPanel', 'backlog');
        Session.set('rightIssuesPanel', this.sprint.gitlab.iid);
        Router.go('planBoard', {id: this.project._id});
    },
    'change #showAllSprintsWorkBoard': function (e) {
        e.preventDefault();
        Session.set("showAllSprintsInWorkBoard", e.target.checked);

        setTimeout(function () {
            if (isNaN($('.form-control :selected').val())) {
                Session.set('workboardSprint', NaN);
            } else {
                Session.set('workboardSprint', parseInt($('.form-control :selected').val()));
            }
        }, 500);
    }
});

Template.workBoardProgressBar.helpers({
    progress: function () {
        //var sprintId = this.sprint.gitlab.d;

        var issues = this.issues.fetch();
        var issue_ids = [];
        for (var i = 0; i < issues.length; i++) {
            issue_ids.push(issues[i]._id);
        }

        var totals = {
            toDo: 0,
            inProgress: 0,
            done: 0
        };

        var tasks = Tasks.find({
            'issue_id': {
                $in: issue_ids
            }
        }).fetch();

        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i].estimation) {
                totals[tasks[i].status] += tasks[i].estimation * 1;
            }
        }
        var total = totals.toDo + totals.inProgress + totals.done;
        toDoPercent = Math.round(100 * totals.toDo / total);
        inProgressPercent = Math.round(100 * totals.inProgress / total);
        donePercent = 100 - toDoPercent - inProgressPercent;
        return [{
            status: 'danger',
            value: totals.toDo,
            percent: toDoPercent,
        }, {
            status: 'warning',
            value: totals.inProgress,
            percent: inProgressPercent,
        }, {
            status: 'success',
            value: totals.done,
            percent: donePercent
        }];

    }
});

Template.workBoard.helpers({
    taskList: function (issueId, status) {
        return Tasks.find({
            $and: [{
                'issue_id': issueId
            }, {
                'status': status
            }]
        });
    },

    daysLeft: function () {
        if (this.sprint && this.sprint.gitlab.due_date) {
            var now = moment();
            var end = moment(this.sprint.gitlab.due_date);
            var diff = end.diff(now, 'days');

            if (diff < 0) {
                return {
                    status: 'late',
                    text: "{0} days overdue".format(-diff)
                }
            } else {
                return {
                    text: "{0} days left".format(diff)
                }
            }
        }
    },

    sprintStats: function (sprintId) {
        var unestimated = Issues.find({
            $and: [{
                sprint: sprintId
            }, {
                $or: [{
                    estimation: {
                        $exists: false
                    }
                }, {
                    estimation: ''
                }]
            }]
        }).fetch();
        var estimated = Issues.find({
            $and: [{
                estimation: {
                    $exists: true
                }
            }, {
                estimation: {
                    $ne: ''
                }
            }, {
                sprint: sprintId
            }]
        }).fetch();
        var closed = Issues.find({
            $and: [{
                estimation: {
                    $exists: true
                }
            }, {
                estimation: {
                    $ne: ''
                }
            }, {
                sprint: sprintId
            }, {
                'gitlab.state': 'closed'
            }]
        }).fetch();
        var totalStories = estimated.length + unestimated.length;
        var doneStories = closed.length;
        var totalTime = _.reduce(_.pluck(estimated, 'estimation'), function (sum, val) {
            return sum + parseInt(val);
        }, 0);
        var doneTime = _.reduce(_.pluck(closed, 'estimation'), function (sum, val) {
            return sum + parseInt(val);
        }, 0);
        return totalTime + ' hours in  ' + totalStories + ' stories (' + unestimated.length + ' unestimated) - ' + doneStories + ' stories closed (' + ~~(doneTime / totalTime * 100) + '% sprint completion)';
    },

    numberOfIssues: function () {
        if (this.issues) {
            return this.issues.count();
        }
    },

    sprintSize: function () {
        var total = 0;

        if (this.issues) {
            var issues = this.issues.fetch();
            var issue_ids = [];
            for (var i = 0; i < issues.length; i++) {
                issue_ids.push(issues[i]._id);
            }

            var tasks = Tasks.find({
                'issue_id': {
                    $in: issue_ids
                }
            }).fetch();

            for (var i = 0; i < tasks.length; i++) {
                if (tasks[i].estimation) {
                    total += tasks[i].estimation * 1;
                }
            }
            return total;
        }
    }
});


Template.workBoardRow.helpers({
    taskList: function (issueId, status) {
        return Tasks.find({
            $and: [{
                'issue_id': issueId
            }, {
                'status': status
            }]
        });
    },
});

Template.workBoardRow.rendered = function () {

    OnElementReady("#issue-" + this.data._id, function (selector) {
        $(selector + " ul").sortable({
            delay: '100',
            opacity: '0.7',
            connectWith: selector + " ul",
            cancel: ".footer, :input, button",
            placeholder: "placeholder",
            stop: function (event, ui) {
                var taskId = $('.task-workboard', ui.item).attr('data-id');
                var task = Tasks.findOne(taskId);
                var newStatus = ui.item.parent().attr('data-status');
                if (task.status != newStatus) {

                    if (newStatus == 'toDo') {
                        Tasks.update(taskId, {
                            $set: {
                                status: newStatus
                            },
                            $unset: {
                                assignee: ''
                            }
                        });
                    } else {
                        Tasks.update(taskId, {
                            $set: {
                                status: newStatus,
                                assignee: Meteor.userId()
                            }
                        });

                        if (newStatus == 'done') {
                            // Check if all tasks are done
                            var tasks = Tasks.find({
                                $and: [{
                                    issue_id: task.issue_id
                                }, {
                                    $or: [{
                                        status: 'inProgress'
                                    }, {
                                        status: 'toDo'
                                    }]
                                }]
                            }).fetch();
                            if (tasks.length == 0) {
                                Issues.update(task.issue_id, {
                                    $set: {
                                        'gitlab.state': 'closed',
                                        'closed_at': new Date()
                                    }
                                });
                                var issue = Issues.findOne(task.issue_id);
                                Meteor.call('pushIssue', task.issue_id, 'close');
                            }
                        } else {
                            Issues.update(task.issue_id, {
                                $set: {
                                    'gitlab.state': 'opened'
                                }
                            });
                            var issue = Issues.findOne(task.issue_id);
                            Meteor.call('pushIssue', task.issue_id, 'reopen');
                        }
                    }
                }
            },

        });
    });
}

Template.workboardSprintDropdown.options = function () {
    var options = 0;
    if (Session.get("showAllSprintsInWorkBoard")) {
        options = _options();
    }
    else {
        options = _activeOptions();
    }
    return options;
}

Template.workboardSprintDropdown.events({
    'change select': function (e) {
        Session.set('workboardSprint', $(e.target).val() * 1);
    }
});

var _options = function () {
    var sprints = Sprints.find({}, {
        sort: {
            'status': "inProgress"
        }
    }).fetch();
    return SprintSelectOptions(sprints);
}

var _activeOptions = function () {
    var sprints = Sprints.find({
        'gitlab.state': 'active'

        /*
         'status': { "$in":['inPlanning','inProgress']}
         */
    }, {
        sort: {
            'status': "inProgress"
        }
    }).fetch();
    return SprintSelectOptions(sprints);
}