Template.projectBacklogAssignees.rendered = function () {
    // Setting sortable property to container
    $("#container").sortable({
        axis: 'y',
        // Saving new issues order in database
        stop: function (event, ui) {
            var data = $("#container").sortable("toArray");
            for (var i = 0; i < data.length; i++) {
                Issues.update(data[i], {
                    $set: {
                        position: i
                    }
                });
            }
        }
    });
    $("#container").disableSelection();
    // Setting default values for x-editable
    $.fn.editable.defaults.mode = 'inline';
    $.fn.editable.defaults.emptytext = '(...)';
    $.fn.editable.defaults.toggle = 'dblclick';
    // Setting editable property to story elements
    $('.storyTitle, .storyType, .storyText, .storyHours').editable({
        // Defining callback function to update story in database after in-place editing
        success: function (response, newValue) {
            var storyId = this.parentElement.getAttribute("id");
            var updateField = {};
            updateField[this.getAttribute("ref")] = newValue;
            Issues.update(storyId, {
                $set: updateField
            });
        }
    });
    // Setting editable property to task elements
    $('.taskTitle, .taskText, .taskHours').editable({
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
}

Template.projectBacklogInput.events = {
    'click input.insert': function () {
        // Gathering necessary new story data
        var projectId = document.getElementById("container").getAttribute("ref");
        var gitlabProjectId = Projects.findOne({
            '_id': projectId
        }).gitlab.id;
        var name = document.getElementById("name");
        var desc = document.getElementById("description");
        var time = document.getElementById("estimate").value;
        var assignee = document.getElementById("assigneeSelector");
        var assigneeName = assignee.options[assignee.selectedIndex].text;
        var assigneeId = Meteor.users.findOne({
            username: assigneeName
        }).gitlab.id;
        var type = document.getElementById("typeSelector");
        var typeName = type.options[type.selectedIndex].text;
        // Adding new story to database
        alert('Function call');
        Meteor.call('insertIssue', {
            'estimate': time,
            'assignee_id': assigneeId,
            'project_id': projectId,
            'gitlab_project_id': gitlabProjectId,
            'title': name.value,
            'description': desc.value,
            'state': typeName,
            'assignee': assigneeName
        });
        // Resetting the input fields
        name.value = '';
        desc.value = '';
    }
}

Template.projectBacklogIssues.events = {
    'click .insertTask': function (event) {
        // Gathering necessary new task data
        var task = event.currentTarget.parentElement;
        var issue = task.parentElement.parentElement.parentElement;
        var issueId = issue.getAttribute("id");
        var name = task.getElementsByClassName("tName")[0];
        var desc = task.getElementsByClassName("tDescription")[0];
        var hours = task.getElementsByClassName("tTime")[0].value;
        var assignee = task.getElementsByClassName("tAssigneeSelector")[0];
        var assigneeName = assignee.options[assignee.selectedIndex].text;
        var assigneeId = Meteor.users.findOne({
            username: assgineeName
        })._id;
        // Adding task to database
        if (name != '') {
            Tasks.insert({
                'issueId': issueId,
                'name': name.value,
                'description': desc.value,
                'estimate': hours,
                'assignee': assigneeName,
                'assignee_id': assigneeId
            });
            // Resetting the input fields
            name.value = '';
            desc.value = '';
        }
    },

    'click .deleteButton': function (event) {
        // Retrieve class and id of parent element
        var parentType = event.currentTarget.parentElement.getAttribute("objectType");
        var parentId = event.currentTarget.parentElement.getAttribute("id");
        var parentTitle = event.currentTarget.parentElement.getAttribute("ref");
        if (parentType == 'issue') {
            var choice = confirm('Confirm deletion of issue: ' + parentTitle);
            if (choice == true) {
                Issues.remove({
                    _id: parentId
                });
            }
        } else if (parentType = 'task') {
            var choice = confirm('Confirm deletion of task: ' + parentTitle);
            if (choice == true) {
                Tasks.remove({
                    _id: parentId
                });
            }
        }
    }
}

Template.projectBacklogAssignees.assignees = function () {
    return Meteor.users.find().fetch();
}

Template.projectBacklogIssues.tasks = function (id) {
    return Tasks.find({
        issueId: id
    });
}