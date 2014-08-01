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
                        if(parentType == 'toDo') {
                            Tasks.update(selfId, {
                                $unset: {'user_avatar': '', 'username': ''}
                            });
                        }
                        ui.item.remove();
                    }
                };
            },
            delay: '100',
            opacity: '0.7',
            connectWith: ".todo.col-md-3, .inprogress.col-md-3, .done.col-md-3",
            cancel: ".footer",
            placeholder: "placeholder"
        }).disableSelection();
    }, 500);
}

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
                work_state: 'done'
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
    'boardStats': function (sprintId, type) {
        if (type == 'unassigned') {
            var unestimated = Issues.find({
                $and: [{
                    sprint: sprintId
            }, {
                    $or: [{
                        work_state: type
                    }, {
                        work_state: {
                            $exists: false
                        }
                    }]
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
            }, {
                    $or: [{
                        work_state: type
                    }, {
                        work_state: {
                            $exists: false
                        }
                    }]
            }]
            }).fetch();
        } else {
            var unestimated = Issues.find({
                $and: [{
                    sprint: sprintId
            }, {
                    work_state: type
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
            }, {
                        work_state: type
                    }
            ]
            }).fetch();
        }
        var totalStories = estimated.length + unestimated.length;
        var totalTime = _.reduce(_.pluck(estimated, 'estimation'), function (sum, val) {
            return sum + parseInt(val);
        }, 0);
        return totalTime + ' hours in  ' + totalStories + ' stories (' + unestimated.length + ' unestimated)';
    }
});