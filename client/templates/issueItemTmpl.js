Template.issueItemTmpl.tasks = function () {
    return Tasks.find({
        issue_id: this._id
    });
}

Template.issueItemTmpl.totalEstimation = function () {
   var tasks = Tasks.find({
        issue_id: this._id
    }).fetch();
    var sum = 0;
    for (var i=0; i<tasks.length; i++) {
        var n = parseFloat(tasks[i].estimation);
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
    },
    
    titleOptions: function () {
        return {
            collection: Issues,
            id: this._id,
            field: 'gitlab.title',
            type: 'text',
            title: 'Issue title',
            value: this.gitlab.title,
            container: 'body',
            validate: function (value) {
                if (!value) {
                    return "This field is required";
                }
            },
            updated: function(id) {
                Meteor.call('pushIssue', this.id);
            }
        };
    },

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
}