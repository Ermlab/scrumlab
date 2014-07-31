Template.taskItemTmpl.helpers({
    'taskState': function (status) {
        if(status == 'toDo') return "To do";
        if(status == 'inProgress') return "In progress";
        if(status == 'done') return "Done";
    }
});