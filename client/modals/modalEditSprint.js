Template.modalEditSprint.sprint = function () {
    // get iid of a sprint based on the panel selection
    var iid = Session.get(this) * 1;
    var sprint = Sprints.findOne({
        'gitlab.iid': iid
    });

    // this can be projectId as well if new sprint is created
    var id;
    var project;
    var origin;
    if (sprint === undefined) {
        id = this + "";
        project = Projects.findOne(id);
        if (project) {
            origin = project.origin;
        }
    }

    return sprint || {
        isNew: true,
        projectId: id,
        origin: origin
    };
}

Template.modalEditSprint.sprintStatus = function () {
    if (this.status === undefined || this.status === null) {
        return 'In planning';
    }
    if (this.status == 'inProgress') {
        return 'In progress';
    }
    if (this.status == 'completed') {
        return 'Completed';
    }
    if (this.status == 'aborted') {
        return 'Aborted';
    }
}

Template.modalEditSprint.canStartSprint = function (sprint) {
    return (this.status === undefined || this.status === null);
}

Template.modalEditSprint.canCompleteSprint = function (sprint) {
    return this.status && this.status == 'inProgress';
}

Template.modalEditSprint.canAbortSprint = function (sprint) {
    return this.status && this.status === 'inProgress';
}


Template.modalEditSprint.events({
    'change input, change textarea': function (e) {
        if (this.isNew === true) {
            // do nothing if this is a new sprint
            return;
        }

        var field = $(e.target).attr('name');
        var value = $(e.target).val();
        var update = {};
        update[field] = value;

        var isValid = true;

        if (field == 'gitlab.title' && value.length == 0) {
            $(e.target).parent().addClass('has-error');
            isValid = false;
        } else {
            $(e.target).parent().removeClass('has-error');
            Sprints.update(this._id, {
                $set: update
            });
            Meteor.call('pushSprint', this._id);
        }
    },

    'click .start-sprint': function (e) {
        e.preventDefault();
        Sprints.update(this._id, {
            $set: {
                status: 'inProgress'
            }
        });
        Meteor.call('pushSprint', this._id);
    },

    'click .complete-sprint': function (e) {
        e.preventDefault();
        Sprints.update(this._id, {
            $set: {
                status: 'completed'
            }
        });
        Meteor.call('pushSprint', this._id);
    },

    'click .abort-sprint': function (e) {
        e.preventDefault();
        Sprints.update(this._id, {
            $set: {
                status: 'aborted'
            }
        });
        Meteor.call('pushSprint', this._id);
    },

    'submit form': function (e) {
        e.preventDefault();

        // form was sumbitted for existing sprint
        if (this._id) {
            // close modal, any changes in input fields will be handled by change event
            Session.set('modal', undefined);
            return;
        }

        var doc = this;
        delete doc.isNew;
        $('input, textarea', e.target).each(function () {
            var field = $(this).attr('name');
            var value = $(this).val();
            if ($(this).attr('required') || value.length > 0) {
                doc[field] = value;
            }
        });
        $('#update-sprint').prop('disabled', true);

        Meteor.call('createSprint', doc, function (error, result) {
            if (result) {
                // wait until new document arrives to client...
                var id = Meteor.setInterval(function () {
                    var sprint = Sprints.findOne(result);
                    if (sprint) {
                        //.. then change panel and close modal
                        Meteor.clearInterval(id);
                        var panel = Session.get("newSprintTarget");
                        Session.set(panel, sprint.gitlab.iid);
                        Session.set('modal', undefined);
                        $('#update-sprint').prop('disabled', false);
                    }
                }, 100);
            } else {
                $('#update-sprint').prop('disabled', false);
            }
        });
    }
});