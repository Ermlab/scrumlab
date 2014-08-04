Template.taskItemTmpl.helpers({
    'taskState': function (status) {
        if (status == 'toDo') return "To do";
        if (status == 'inProgress') return "In progress";
        if (status == 'done') return "Done";
    },

    'statusCheck': function (status, input) {
        if (status == input) return true
        else return false;
    }
});

Template.taskItemTmpl.events = {
    'click .deleteTaskButton': function (event) {
        var selfId = event.currentTarget.getAttribute("id");
        var parentId = event.currentTarget.getAttribute("issueId");
        var choice = confirm('Do you want to remove selected task?');
        if (choice == true) {
            Tasks.remove({
                _id: selfId
            });
            var taskNumber = Tasks.find({
                issue_id: parentId
            }).fetch().length;
            // Insert placeholder task if no tasks remain
            if (taskNumber == 0) {
                var issue = Issues.findOne({
                    _id: parentId
                });
                console.dir(issue);
                Tasks.insert({
                    'project_id': issue.project_id,
                    'issue_id': parentId,
                    'name': issue.gitlab.title,
                    'status': 'toDo',
                    'placeholder': true
                });
            }
        }
    },
    
    'blur .taskTitle': function(event) {
        var newValue = event.currentTarget.innerHTML.trim();
        var taskId = event.currentTarget.getAttribute("id");
        Tasks.update(taskId, {$set: {'name': newValue}});
    }
}