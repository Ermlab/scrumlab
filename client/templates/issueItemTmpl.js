Template.issueItemTmpl.tasks = function () {
    return Tasks.find({
        issue_id: this._id
    });
}

Template.issueItemTmpl.totalEstimate = function () {
   var tasks = Tasks.find({
        issue_id: this._id
    }).fetch();
    var sum = 0;
    for (var i=0; i<tasks.length; i++) {
        var n = parseFloat(tasks[i].estimate);
        if (!isNaN(n)) {
            sum += n;
        }
    }
    return sum;
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
    },

    'workBoard': function () {
        var board = _.last(document.URL.split('/'));
        if (board == 'work') return true;
        return false;
    }
});


Template.issueItemTmpl.events = {
    'focus .inline-edit': function (e) {
        $(e.target).data('original', $(e.target).text());
        // TODO: select all text on edit - not working
        //$(e.target).selectText();
        
        if ($(e.target).hasClass('inline-placeholder')) {
            // clear placeholder
            console.log('aa', $(e.target).is(':focus'));
            //$(e.target).text('');
            console.log('bb', $(e.target).is(':focus'));
            $(e.target).selectText();
        }
    },

    'keydown .inline-edit': function (e) {
        switch (e.keyCode) {
            case 13:
                // Enter key was pressed
                e.preventDefault();
                var field = $(e.target).data("name");
                var value = $(e.target).text();
                var id = this._id;
                var update = {};
                update[field] = value;
                $(e.target).blur();
                // Fix for doubling text input with contenteditable
                $(e.target).text("");
                Meteor.defer(function() {
                    Issues.update(id, {
                        $set: update
                    });
                    Meteor.call('pushIssue', id);
                });
                break;
            case 27:
                // Esc key was pressed
                e.preventDefault();
                $(e.target).text($(e.target).data('original'));
                $(e.target).blur();
                break;
        }
    },
    
    /*
    'blur .inline-edit': function (e) {
                var field = $(e.target).data("name");
                var value = $(e.target).text();
                console.log('down',field,value);        
    }
    
    /*
    'keypress .inline-edit': function (e) {
        console.log('press',e.keyCode);
        if (e.keyCode==13) {
            e.preventDefault();
            var field = $(e.target).data("name");
            var value = $(e.target).text();
            console.log('press',field,value);
        }
    },

    'keyup .inline-edit': function (e) {
        console.log('up',e.keyCode);
        if (e.keyCode==13) {
            //e.preventDefault();
            var field = $(e.target).data("name");
            var value = $(e.target).text();
            console.log('up',field,value);
        }
    },
    */
    

    /*
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
        if (isNaN(newValue) || (newValue.length == 0))
            event.currentTarget.innerHTML = '<span id={{_id}} contenteditable="true" class="glyphicon glyphicon-time"></span>';
        else
            Issues.update(issueId, {
                $set: {
                    estimation: newValue
                }
            });
    },

    'focus .label.label-warning.pull-left': function (event) {
        var newValue = event.currentTarget.innerHTML.trim();
        if (isNaN(newValue)) event.currentTarget.innerHTML = ' ';
    },

    'keydown .label.label-warning.pull-left': function (event) {
        var newValue = event.currentTarget.innerHTML;
        if (newValue.length == 0) event.currentTarget.innerHTML = ' ';
    }
    */
}