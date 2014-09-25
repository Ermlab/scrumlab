Template.tasksListTmpl.events({
    'submit .new-task form': function (e) {
        e.preventDefault();
        
        var title = $(e.target).find('[name=title]').val().trim();
        
        // Add task to database
        if (title != '') {
            
            var parts = title.split(' ');
            var est = parseFloat(parts[parts.length-1]);
            if (isNaN(est)) {
                est = undefined;
            }
            else {
                parts.pop();
                title = parts.join(' ');
            }
            
            Tasks.insert({
                project_id: this.issue.project_id,
                issue_id: this.issue._id,
                name: title,
                status: 'toDo',
                estimate: est               
            });
            // Resetting the input fields
            title.value = '';
            // Removing placeholder task if exists
            var placeholder = Tasks.findOne({
                $and: [{
                    'issue_id': this.issue._id
                }, {
                    'placeholder': true
                }]
            });
            if (typeof placeholder != 'undefined') Tasks.remove(placeholder._id);
            $(e.target).each(function () {
                this.reset();
            });
        }
        
        
    }
});