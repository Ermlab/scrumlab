Template.workBoard.rendered = function () {
    $(".story, #todo, #inprogress, #done").sortable({
        stop: function (event, ui) {
            var selfId = ui.item.attr("id");
            var parentType = ui.item.parent().attr("id");
            var actualState = Issues.findOne({
                _id: selfId
            }).work_state;
            if (actualState == undefined) actualState == 'unassigned';
            if (actualState != parentType) {
                Issues.update(selfId, {
                    $set: {
                        work_state: parentType
                    }
                });
                ui.item.remove();
            }
        },
        connectWith: ".story, #todo, #inprogress, #done",
        cancel: ".footer"
    }).disableSelection();
}

Template.workBoard.helpers({
    'issueList': function (sprintId, type) {
        if (type == 'unassigned') {
            return Issues.find({
                $and: [{
                        'sprint': sprintId
            },
                    {
                        $or: [{
                            'work_state': 'unassigned'
                    }, {
                            'work_state': {
                                $exists: false
                            }
                    }]
                    }]
            });
        } else
            return Issues.find({
                $and: [{
                    'sprint': sprintId
            }, {
                    'work_state': type
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