Template.newTask.events({
    'submit form': function (e) {
        e.preventDefault();
        
        var title = $(e.target).find('[name=title]').val().trim();
        
        // Add task to database
        if (title != '') {
            Tasks.insert({
                project_id: this.project_id,
                issue_id: this._id,
                name: title,
                status: 'toDo',
            });
            // Resetting the input fields
            title.value = '';
            // Removing placeholder task if exists
            var placeholder = Tasks.findOne({
                $and: [{
                    'issue_id': this._id
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