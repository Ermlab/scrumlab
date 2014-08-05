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
            if (typeof placeholder != 'undefined') Tasks.remove(placeholder._id, {
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
    },
    
    'click .description.list-group-item-text': function (event) {
        event.currentTarget.setAttribute('contenteditable', true);
    },
    
    'click .title.list-group-item-heading': function (event) {
        event.currentTarget.setAttribute('contenteditable', true);
    },
    /*
    'click .label.label-warning.pull-left': function (event) {
        event.currentTarget.setAttribute('contenteditable', true);
    },*/

    'blur .description.list-group-item-text': function (event) {
        var newValue = event.currentTarget.innerHTML.trim();
        // Hack for issue described here: https://github.com/meteor/meteor/issues/1964
        event.currentTarget.innerHTML = newValue;
        // /hack
        var issueId = event.currentTarget.getAttribute("id");
        Issues.update(issueId, {
            $set: {
                'gitlab.description': newValue
            }
        });
        var issue = Issues.findOne({
            '_id': issueId
        });
        var gitlabIssueId = issue.gitlab.id;
        var gitlabProjectId = issue.gitlab.project_id;
        var updateObject = {
            'id': gitlabProjectId,
            'issue_id': gitlabIssueId,
            'description': newValue
        };
        Meteor.call('editIssue', updateObject);
        event.currentTarget.setAttribute('contenteditable', false);
    },

    'blur .title.list-group-item-heading': function (event) {
        var newValue = event.currentTarget.innerHTML.trim();
        var issueId = event.currentTarget.getAttribute("id");
        Issues.update(issueId, {
            $set: {
                'gitlab.title': newValue
            }
        });
        var issue = Issues.findOne({
            '_id': issueId
        });
        var gitlabIssueId = issue.gitlab.id;
        var gitlabProjectId = issue.gitlab.project_id;
        var updateObject = {
            'id': gitlabProjectId,
            'issue_id': gitlabIssueId,
            'title': newValue
        };
        Meteor.call('editIssue', updateObject);
        event.currentTarget.setAttribute('contenteditable', false);
    },

    'blur .label.label-warning.pull-left': function (event) {
        var newValue = event.currentTarget.innerHTML.trim();
        var issueId = event.currentTarget.getAttribute("id");
        if (newValue == ' ') {}
        else if (isNaN(newValue) || (newValue.length == 0))
            event.currentTarget.innerHTML = '<span id={{_id}} contenteditable="true" class="glyphicon glyphicon-time"></span>';
        else
            Issues.update(issueId, {
                $set: {
                    estimation: newValue
                }
            });
        //event.currentTarget.setAttribute('contenteditable', false);
    },

    'focus .label.label-warning.pull-left': function (event) {
        var newValue = event.currentTarget.innerHTML.trim();
        if (isNaN(newValue)) event.currentTarget.innerHTML = ' ';
    },

    'keydown .label.label-warning.pull-left': function (event) {
        var newValue = event.currentTarget.innerHTML;
        if (newValue.length == 0) event.currentTarget.innerHTML = ' ';
    }
}