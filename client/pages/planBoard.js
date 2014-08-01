Template.planBoardSprintsInput.rendered = function () {
    Meteor.setTimeout(function () {
        // Setting default values for x-editable
        $.fn.editable.defaults.mode = 'inline';
        $.fn.editable.defaults.emptytext = '(...)';
        $.fn.editable.defaults.toggle = 'dblclick';
        // Setting editable property to story elements
        $('.storyTitle, .storyText, .storyHours').editable({
            // Defining callback function to update story in database after in-place editing
            success: function (response, newValue) {
                var issueId = this.parentElement.getAttribute("id");
                var issue = Issues.findOne({
                    '_id': issueId
                });
                var gitlabIssueId = issue.gitlab.id;
                var gitlabProjectId = issue.gitlab.project_id;
                var updateField = this.getAttribute("ref");
                var updateObject = {
                    'id': gitlabProjectId,
                    'issue_id': gitlabIssueId
                };
                if (updateField == 'estimation') {
                    Issues.update(issueId, {
                        $set: {
                            estimation: newValue
                        }
                    });
                } else {
                    updateObject[updateField] = newValue;
                    Meteor.call('editIssue', updateObject);
                    Meteor.call('refreshUserProjects');
                }
            }
        });

        // Setting editable property to task elements
        $('.taskTitle, .taskHours').editable({
            // Defining callback function to update task in database after in-place editing
            success: function (response, newValue) {
                var taskId = this.parentElement.getAttribute("id");
                var updateField = {};
                updateField[this.getAttribute("ref")] = newValue;
                Tasks.update(taskId, {
                    $set: updateField
                });
            }
        });

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
            cancel: ".form-control",
            placeholder: "placeholder"
        }).disableSelection();
        // Setting datepicker property for easy date selection
        $("#datepicker").datepicker();
    }, 500);
}


Template.planBoardSprints.events = {
    'click .insertTask': function (event) {
        // Gathering necessary new task data
        var task = event.currentTarget.parentElement;
        var issue = task.parentElement.parentElement;
        var issueId = issue.getAttribute("id");
        var projectId = document.getElementById("projectId").getAttribute("ref");
        var name = task.getElementsByClassName("tName")[0];
        var hours = task.getElementsByClassName("tTime")[0].value;
        var assignee = task.getElementsByClassName("tAssigneeSelector")[0];
        var assigneeName = assignee.options[assignee.selectedIndex].text;
        var assigneeId = Meteor.users.findOne({
            username: assigneeName
        })._id;
        // Adding task to database
        if (name != '') {
            Tasks.insert({
                'project_id': projectId,
                'issue_id': issueId,
                'name': name.value,
                'estimation': hours,
                'assignee': assigneeName,
                'assignee_id': assigneeId
            });
            // Resetting the input fields
            name.value = '';
        }
    },
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

Template.planBoardAssignees.assignees = function () {
    return Meteor.users.find().fetch();
}

Template.planBoardSprintsList.assignedItems = function (ownerId) {
    return Issues.find({
        sprint: ownerId
    }, {
        sort: {
            position: 1
        }
    });
}

Template.planBoardSprintsList.events = {
    'click .startButton': function (event) {
        // Check if current user is the owner of the project
        var projectId = document.getElementById("projectId").getAttribute("ref");
        if (CheckIfOwner(projectId)) {
            // Get selected sprint data
            var parentId = event.currentTarget.parentElement.getAttribute("id");
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
            } else if (sprint.status == 'in progress') alert('Sprint already in progress');
            else if (sprint.status == 'closed') alert('This sprint has already finished');
        } else alert('Only owner can start a sprint');
    },
    'click .stopButton': function (event) {
        // Check if current user is the owner of the project
        var projectId = document.getElementById("projectId").getAttribute("ref");
        if (CheckIfOwner(projectId)) {
            // Get selected sprint data
            var parentId = event.currentTarget.parentElement.getAttribute("id");
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
        } else alert('Only owner can stop a sprint');
    },
}

Template.planBoardSprintsInput.events = {
    'click input.insert': function (event) {
        var name = document.getElementById("name");
        var date = document.getElementById("datepicker");
        var projectId = document.getElementById("projectId").getAttribute("ref");
        Sprints.insert({
            name: name.value,
            endDate: date.value,
            project_id: projectId,
            status: 'ready'
        });
        name.value = '';
        date.value = '';
    }
}