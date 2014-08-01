Template.taskItemTmpl.helpers({
    'taskState': function (status) {
        if(status == 'toDo') return "To do";
        if(status == 'inProgress') return "In progress";
        if(status == 'done') return "Done";
    },
    
    'statusCheck': function (status) {
        if(status == 'done') return false;
        else return true;
    }
});

Template.taskItemTmpl.events = {
    'click .deleteTaskButton': function (event) {
        var parentId = event.currentTarget.getAttribute("id");
        var choice = confirm('Do you want to remove selected task?');
            if (choice == true) {
                Tasks.remove({
                    _id: parentId
                });
            }
    }
}