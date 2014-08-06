Template.planBoardSprintsInput.rendered = function () {
    Meteor.setTimeout(function () {
        $("#backlog, .sprint").sortable({
            stop: function (event, ui) {
                // Getting the element id and containing sprint's id (or a backlogItems container)
                var ownerId = ui.item.parent().attr("id");
                var selfId = ui.item.attr("id");
                var previousId = ui.item.attr("ref");
                // If no owner is specified or element was returned to backlog container ownerId is set to 0
                if (ownerId == 'backlog') ownerId = '0';
                // If no previous owner present, previousId is set to 0
                if (typeof (previousId) == 'undefined') previousId = '0';
                // Check if the item was dropped back in container it was taken from by
                // comparing parent id with original parent id stored in "ref" variable
                if (ownerId != previousId) {
                    // Check if owner is actually a sprint
                    if (ownerId != 0) {
                        Issues.update(selfId, {
                            $set: {
                                sprint: ownerId
                            }
                        });
                    } else {
                        // If ownerId = 0, the field sprint is removed
                        // resulting in element becoming unassigned
                        Issues.update(selfId, {
                            $unset: {
                                sprint: ""
                            }
                        });
                    }
                    // Getting rid of the duplicated ui item
                    ui.item.remove();
                }
                // If so, starting positioning query
                var data = $("#backlog").sortable("toArray");
                for (var i = 0; i < data.length; i++) {
                    Issues.update(data[i], {
                        $set: {
                            position: i
                        }
                    });
                }
            },
            delay: '100',
            connectWith: "#backlog, .sprint",
            // Elements to exclude from sortable list
            cancel: ".form-control, :input, button, [contenteditable]",
            placeholder: "placeholder"
        });
        $("#sprints").sortable({
            stop: function (event, ui) {
                var data = $("#sprints").sortable("toArray");
                for (var i = 0; i < data.length; i++) {
                    // Skipping the sprint input element
                    if (data[i] == 'addSprint') continue;
                    Sprints.update(data[i], {
                        $set: {
                            position: i
                        }
                    });
                }
            },
            delay: '100',
            connectWith: "#sprints",
            // Elements to exclude from sortable list
            cancel: ".form-control, :input, button, [contenteditable]",
            placeholder: "placeholder"
        });
        // Setting datepicker property for easy date selection
        $("#datepicker").datepicker();
    }, 500);
}

Template.planBoardSprintsList.helpers({
    'sprintsStats': function (sprint_id) {
        var unestimated = Issues.find({
            $and: [{
                sprint: sprint_id
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
                sprint: sprint_id
            }]
        }).fetch();
        var totalStories = estimated.length + unestimated.length;
        var totalTime = _.reduce(_.pluck(estimated, 'estimation'), function (sum, val) {
            return sum + parseInt(val);
        }, 0);
        return totalTime + ' hours in  ' + totalStories + ' stories (' + unestimated.length + ' unestimated)';
    },

    'checkIfReady': function (status) {
        if (status == 'in progress') return false;
        else return true;
    },

    'sprintStatus': function (sprintStatus, input) {
        if (sprintStatus == input) {
            return true;
        } else {
            return false;
        }
    }
});

Template.planBoardSprints.helpers({
    'issuesStats': function () {
        var unestimated = Issues.find({
            $and: [{
                sprint: {
                    $exists: false
                }
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
                sprint: {
                    $exists: false
                }
            }]
        }).fetch();
        var totalStories = estimated.length + unestimated.length;
        var totalTime = _.reduce(_.pluck(estimated, 'estimation'), function (sum, val) {
            return sum + parseInt(val);
        }, 0);
        return totalTime + ' hours in  ' + totalStories + ' stories (' + unestimated.length + ' unestimated)';
    }
});

Template.planBoardSprintsList.assignedItems = function (ownerId) {
    return Issues.find({
        sprint: ownerId
    }, {
        sort: {
            position: 1,
            created_at: -1
        }
    });
}

Template.planBoardSprintsList.events = {
    'click .btn.btn-success.btn-sm': function (event) {
        // Check if current user is the owner of the project
        var projectId = document.getElementById("projectId").getAttribute("ref");
        if (CheckIfOwner(projectId)) {
            // Get selected sprint data
            var parentId = event.currentTarget.getAttribute("id");
            var sprint = Sprints.findOne({
                _id: parentId
            });
            // Check if sprint is ready to start
            if (sprint.status == 'ready') {
                // Check if sprint is not overdue already
                var finish = sprint.endDate;
                if (CheckDate(sprint.endDate) == true) {
                    // Update sprint status
                    Sprints.update(parentId, {
                        $set: {
                            status: 'in progress'
                        }
                    });
                } else alert('Sprint is already overdue.');
            } else if (sprint.status == 'in progress') alert('Sprint already in progress.');
        } else alert('Only owner can start a sprint.');
    },

    'click .btn.btn-danger.btn-sm': function (event) {
        // Check if current user is the owner of the project
        var projectId = document.getElementById("projectId").getAttribute("ref");
        if (CheckIfOwner(projectId)) {
            // Get selected sprint data
            var parentId = event.currentTarget.getAttribute("id");
            var sprint = Sprints.findOne({
                _id: parentId
            });
            // Check if sprint is in progress
            if (sprint.status == 'in progress') {
                Sprints.update(parentId, {
                    $set: {
                        status: 'ready'
                    }
                });
            };
        } else alert('Only owner can stop a sprint.');
    },

    'blur .sprintTitle': function (event) {
        var newValue = event.currentTarget.innerHTML.trim();
        var sprintId = event.currentTarget.getAttribute("id");
        Sprints.update(sprintId, {
            $set: {
                name: newValue
            }
        });
    },
}

Template.planBoardSprintsInput.events = {
    'submit form': function (event) {
        var name = document.getElementById("name");
        var date = document.getElementById("datepicker");
        var projectId = document.getElementById("projectId").getAttribute("ref");

        if (date.value == "") {
            alert("Please select date");
        } else if (name.value == "") {
            alert("Please write title of sprint");
        } else {
            Sprints.insert({
                name: name.value,
                endDate: date.value,
                project_id: projectId,
                status: 'ready'
            });
        }

        name.value = '';
        date.value = '';

        $(e.target).find('[name=name]').focus();
    }
}