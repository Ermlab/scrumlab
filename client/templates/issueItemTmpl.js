Template.issueItemTmpl.tasks = function (id) {
    return Tasks.find({
        issue_id: id
    });
}

Template.issueItemTmpl.helpers({
    'checkIfDone': function (id) {
        var tasks = Tasks.find({
            $and: [{
                issue_id: id
            }, {
                $or: [{
                    status: 'inProgress'
                }, {
                    status: 'toDo'
                }]
            }]
        }).fetch();
        if (tasks.length == 0) return true;
        else return false;
    }
});

Template.issueItemTmpl.events = {
    'click .glyphicon-th-list': function (e) {
        e.preventDefault();
        $('#' + e.currentTarget.parentElement.parentElement.getAttribute("id") + ' .collapse').collapse('toggle');
    },

    'submit form': function (e) {
        e.preventDefault();

        var title = $(e.target).find('[name=title]').val().trim();

        var task = event.target;
        var issueId = task.getAttribute("id");
        var projectId = document.getElementById("projectId").getAttribute("ref");

        console.log(projectId);

        // Adding task to database
        if (title != '') {
            Tasks.insert({
                'project_id': projectId,
                'issue_id': issueId,
                'name': title,
                'status': 'toDo'
            });
            // Resetting the input fields
            title.value = '';
            // Removing placeholder task if exists
            var placeholder = Tasks.findOne({
                $and: [{
                    'issue_id': issueId
                }, {
                    'placeholder': true
                }]
            });
            if (placeholder != undefined) Tasks.remove(placeholder._id, {
                justOne: true
            });
            $(e.target).each(function () {
                this.reset();
            });
        }
    },

    'click .deleteButton': function (event) {
        var parentId = event.currentTarget.getAttribute("id");
        var choice = confirm('Do you want to remove selected issue?');
        if (choice == true) {
            Issues.remove({
                _id: parentId
            });
        }
    }
}