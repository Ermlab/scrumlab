Template.userStories.rendered = function () {
    $("#container").sortable({
        axis: 'y',
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
    $.fn.editable.defaults.emptytext = 'Brak';
    $.fn.editable.defaults.toggle = 'dblclick';
    $('.storyTitle, .storyType, .storyText, .storyHours, .storyAssignee').editable({
        success: function (response, newValue) {
            var storyId = this.parentElement.getAttribute("id");
            var updateField = {};
            updateField[this.getAttribute("ref")] = newValue;
            Stories.update(storyId, {
                $set: updateField
            });
        }
    });
    $('.taskTitle, .taskText, .taskHours, .taskAssignee').editable({
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

Template.storiesInput.events = {
    'click input.insert': function () {
        var name = document.getElementById("name");
        var desc = document.getElementById("description");
        var hours = document.getElementById("time").value;
        var assignee = document.getElementById("assigneeSelector");
        var assigneeName = assignee.options[assignee.selectedIndex].text;
        var type = document.getElementById("typeSelector");
        var typeName = type.options[type.selectedIndex].text;
        Stories.insert({
            name: name.value,
            description: desc.value,
            time: hours,
            type: typeName,
            assignee: assigneeName
        });
        name.value = '';
        desc.value = '';
    }
}

Template.userStories.events = {
    'click .insertTask': function (event) {
        var task = event.currentTarget.parentElement;
        var story = task.parentElement.parentElement.parentElement;
        var storyId = story.getAttribute("id");
        var name = task.getElementsByClassName("tName")[0];
        var desc = task.getElementsByClassName("tDescription")[0];
        var hours = task.getElementsByClassName("tTime")[0].value;
        var assignee = task.getElementsByClassName("tAssigneeSelector")[0];
        var assigneeName = assignee.options[assignee.selectedIndex].text;
        if (name != '') {
            Tasks.insert({
                storyId: storyId,
                name: name.value,
                description: desc.value,
                time: hours,
                assignee: assigneeName
            });
            name.value = '';
            desc.value = '';
        }
    }
}

Template.assignees.assignees = function () {
    return Assignees.find();
}

Template.userStories.backlogItems = function () {
    return Stories.find({}, {
        sort: {
            position: 1
        }
    });
}

Template.userStories.tasks = function (id) {
    return Tasks.find();
}