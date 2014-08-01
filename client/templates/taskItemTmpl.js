Template.taskItemTmpl.helpers({
    'taskState': function (status) {
        if(status == 'toDo') return "To do";
        if(status == 'inProgress') return "In progress";
        if(status == 'done') return "Done";
    }
});

Template.taskItemTmpl.events = {
    'click .deleteButton': function (event) {
        var parentId = event.currentTarget.getAttribute("id");
        var choice = confirm('Do you want to remove selected task?');
            if (choice == true) {
                Tasks.remove({
                    _id: parentId
                });
            }
    }
}