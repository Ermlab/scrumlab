Template.taskItemTmpl.helpers({
    'estimate': function () {
        return this.estimate || "N/A";
    },

    'estimateDataValue': function () {
        if (isNaN(parseFloat(this.estimate))) {
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
    $('.editable').editable({
        success: function (response, newValue) {
            var value = parseFloat(newValue);
            if (!isNaN(value)) {
                XEditableUpdate(Tasks, this, value);
            }
        }
    });
}