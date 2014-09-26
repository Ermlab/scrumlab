Template.taskItemTmpl.helpers({
    'estimation': function () {
        return this.estimation;// || "N/A";
    },

    'estimateDataValue': function () {
        if (isNaN(parseFloat(this.estimation))) {
            return "";
        }
        return this.estimate;
    },

    'taskState': function (status) {
        if (status == 'toDo') return "Todo";
        if (status == 'inProgress') return "In progress";
        if (status == 'done') return "Done";
    },

    'statusCheck': function (status, input) {
        if (status == input) return true;
        else return false;
    },
    
    estimationOptions: function () {
        return {
            collection: Tasks,
            id: this._id,
            field: 'estimation',
            type: 'text',
            title: 'Task estimation',
            value: this.estimation,
            emptytext: 'N/A',
            container: 'body',
            validate: function (value) {
                if (isNaN(parseFloat(value))) {
                    return "Number is required";
                }
            }
        };
    },
    
    nameOptions: function () {
        return {
            collection: Tasks,
            id: this._id,
            field: 'name',
            type: 'text',
            title: 'Task name',
            value: this.name,
            container: 'body',
        };
    }
});

Template.taskItemTmpl.events = {
    'click .delete-task': function (e) {
        Tasks.remove(this._id);

        // add placeholder task if needed
        if (Tasks.find({
            issue_id: this.issue_id
        }).count() == 0) {
            AddPlaceholderTaskToIssue(this.issue_id);
        }
    },

    'click .taskTitle': function (event) {
        //event.currentTarget.setAttribute('contenteditable', true);
    },

    'blur .taskTitle': function (event) {
        /*
        var newValue = event.currentTarget.innerHTML.trim();
        var taskId = event.currentTarget.getAttribute("id");
        Tasks.update(taskId, {$set: {'name': newValue}});
        event.currentTarget.setAttribute('contenteditable', false);
        */
    }
}


Template.taskItemTmpl.rendered = function () {
}