Template.backlogStories.rendered = function () {
    // Setting sortable property to container
    $("#container").sortable({
        axis: 'y',
        // Saving new stories order in database
        stop: function (event, ui) {
            var data = $("#container").sortable("toArray");
            for (var i = 0; i < data.length; i++) {
                Stories.update(data[i], {
                    $set: {
                        position: i
                    }
                });
            }
        }
    });
    $("#container").disableSelection();
    // Setting default values for x-editable
    $.fn.editable.defaults.emptytext = 'Brak';
    $.fn.editable.defaults.toggle = 'dblclick';
    // Setting editable property to story elements
    $('.storyTitle, .storyType, .storyText, .storyHours, .storyAssignee').editable({
        // Defining callback function to update story in database after in-place editing
        success: function (response, newValue) {
            var storyId = this.parentElement.getAttribute("id");
            var updateField = {};
            updateField[this.getAttribute("ref")] = newValue;
            Stories.update(storyId, {
                $set: updateField
            });
        }
    });
    // Setting editable property to task elements
    $('.taskTitle, .taskText, .taskHours, .taskAssignee').editable({
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

Template.backlogInput.events = {
    'click input.insert': function () {
        // Gathering necessary new story data
        var name = document.getElementById("name");
        var desc = document.getElementById("description");
        var hours = document.getElementById("time").value;
        var assignee = document.getElementById("assigneeSelector");
        var assigneeName = assignee.options[assignee.selectedIndex].text;
        var type = document.getElementById("typeSelector");
        var typeName = type.options[type.selectedIndex].text;
        // Adding new story to database
        Stories.insert({
            name: name.value,
            description: desc.value,
            time: hours,
            type: typeName,
            assignee: assigneeName,
            sprint: '0'
        });
        // Resetting the input fields
        name.value = '';
        desc.value = '';
    }
}

Template.backlogStories.events = {
    'click .insertTask': function (event) {
        // Gathering necessary new task data
        var task = event.currentTarget.parentElement;
        var story = task.parentElement.parentElement.parentElement;
        var storyId = story.getAttribute("id");
        var name = task.getElementsByClassName("tName")[0];
        var desc = task.getElementsByClassName("tDescription")[0];
        var hours = task.getElementsByClassName("tTime")[0].value;
        var assignee = task.getElementsByClassName("tAssigneeSelector")[0];
        var assigneeName = assignee.options[assignee.selectedIndex].text;
        // Adding task to database
        if (name != '') {
            Tasks.insert({
                storyId: storyId,
                name: name.value,
                description: desc.value,
                time: hours,
                assignee: assigneeName
            });
            // Resetting the input fields
            name.value = '';
            desc.value = '';
        }
    }
}

Template.backlogAssignees.assignees = function () {
    return Assignees.find();
}

Template.backlogStories.backlogItems = function () {
    return Stories.find({}, {
        sort: {
            position: 1
        }
    });
}

Template.backlogStories.tasks = function (id) {
    return Tasks.find();
}