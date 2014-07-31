Template.issueItemTmpl.tasks = function (id) {
    return Tasks.find({
        issue_id: id
    });
}

Template.issueItemTmpl.events = {

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

            $(e.target).each(function () {
                this.reset();
            });
        }
    }
}