Template.workBoard.rendered = function () {
    Meteor.setTimeout(function () {
        $(".todo.col-md-3, .inprogress.col-md-3, .done.col-md-3").sortable({
            stop: function (event, ui) {
                // Check if task was moved to another issue
                var issueId = ui.item.attr("issueId");
                var parentId = ui.item.parent().attr("id");
                if (issueId != parentId) {
                    event.preventDefault();
                } else {
                    var selfId = ui.item.attr("id");
                    var parentType = ui.item.parent().attr("class").split(' ')[0];
                    var actualState = Tasks.findOne({
                        _id: selfId
                    }).status;
                    var avatar = Meteor.user().gitlab.avatar_url;
                    var username = Meteor.user().gitlab.username;
                    if (parentType == 'inprogress') parentType = 'inProgress';
                    else if (parentType == 'todo') parentType = 'toDo';
                    if (actualState != parentType) {
                        Tasks.update(selfId, {
                            $set: {
                                'status': parentType,
                                'user_avatar': avatar,
                                'username': username
                            }
                        });
                        if (parentType == 'toDo') {
                            Tasks.update(selfId, {
                                $unset: {
                                    'user_avatar': '',
                                    'username': ''
                                }
                            });
                        }
                        ui.item.remove();
                        if (parentType == 'done') {
                            // Check if all tasks are done
                            var tasks = Tasks.find({
                                $and: [{
                                    issue_id: issueId
                                }, {
                                    $or: [{
                                        status: 'inProgress'
                                }, {
                                        status: 'toDo'
                                }]
                                }]
                            }).fetch();
                            if (tasks.length == 0) {
                                Issues.update(issueId, {
                                    $set: {
                                        'gitlab.state': 'closed',
                                        'closed_at': CurrDate()
                                    }
                                });
                                var issue = Issues.findOne(issueId);
                                var updateObject = {
                                    'id': issue.gitlab.project_id,
                                    'issue_id': issue.gitlab.id,
                                    'state_event': 'close'
                                }
                                Meteor.call('editIssue', updateObject);
                            }
                        } else {
                            Issues.update(issueId, {
                                $set: {
                                    'gitlab.state': 'opened'
                                }
                            });
                            var issue = Issues.findOne(issueId);
                            var updateObject = {
                                'id': issue.gitlab.project_id,
                                'issue_id': issue.gitlab.id,
                                'state_event': 'reopen'
                            }
                            Meteor.call('editIssue', updateObject);
                        }
                    }
                };
            },
            delay: '100',
            opacity: '0.7',
            connectWith: ".todo.col-md-3, .inprogress.col-md-3, .done.col-md-3",
            cancel: ".footer, :input, button, [contenteditable]",
            placeholder: "placeholder"
        })
    }, 500);
}

Template.workBoardProgressBar.helpers({
    'progress': function (sprintId, status) {
        var issueIds = _.pluck(Issues.find({
            sprint: sprintId
        }).fetch(), '_id');
        var taskCount = Tasks.find({
            $and: [{
                'issue_id': {
                    $in: issueIds
                }
            }, {
                'status': status
            }]
        }).fetch().length;
        var totalCount = Tasks.find({
            'issue_id': {
                $in: issueIds
            }
        }).fetch().length;
        var output = (taskCount / totalCount) * 100;
        return Math.floor(output * 10) / 10;
    }
});

Template.workBoard.helpers({
    'taskList': function (issueId, status) {
        return Tasks.find({
            $and: [{
                'issue_id': issueId
                }, {
                'status': status
            }]
        });
    },

    'sprintStats': function (sprintId) {
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
    }
});