Template.issuesPanel.selectedSprint = function () {
    var options = _options(this.name);
    var selected = Session.get(this.name + "IssuesPanel") || options[0].value;
    for (var i = 0; i < options.length; i++) {
        if (options[i].value == selected) {
            return options[i];
        }
    }
}

Template.issuesPanel.issues = function (sprint) {
    switch (sprint) {
    case 'sandbox':
        return Issues.find({
            sprint: sprint
        });
    case 'backlog':
        return Issues.find({
            'gitlab.milestone.iid': {
                $exists: false
            },
            $or: [{
                sprint: sprint
            }, {
                sprint: {
                    $exists: false
                }
            }]
        });
        break;
    default:
        return Issues.find({
            'gitlab.milestone.iid': sprint * 1
        });
    }
}, 0

Template.issuesPanel.created = function () {
    $(window).resize(function () {
        resizePanels();
    });
}

Template.issuesPanel.destroyed = function () {
    $(window).off('resize');
};

Template.issuesPanel.rendered = function () {
    var id = Meteor.setInterval(function () {
        if (resizePanels()) {
            Meteor.clearInterval(id);
        }
    }, 10);
}

Template.issuesPanel.events({
    'click .edit-sprint': function (e) {
        e.preventDefault();
        Session.set('modal', {
            template: 'modalEditSprint',
            data: this.name + 'IssuesPanel'
        });
    }
});


Template.issuesPanelDropdown.options = function () {
    return _options(this.name);
}

Template.issuesPanelDropdown.selectedSprint = function () {
    return Session.get(this.panel + 'IssuesPanel');
}

Template.issuesPanelDropdown.events({
    'click .new-issue': function (e) {
        var panel = $(e.target).parents('.issues-panel')[0];
        var panelBody = $(panel).find('.issues-panel-body')[0];
        var newIssue = $(panelBody).find('.issues-list .new-issue-wrapper');

        $(newIssue).show();
        $(panelBody).scrollTo(newIssue, 300);
    },

    'click .new-sprint': function (e) {
        Session.set('modal', {
            template: 'modalEditSprint',
            data: null
        });

    },

    'change select.container': function (e) {
        Session.set(this.name + 'IssuesPanel', $(e.target).val());
    }
});



Template.issuesPanelNewIssue.events({
    'click .close-it': function (e) {
        $(e.target).parents('li.new-issue-wrapper').hide();
    },
    'submit .new-issue form': function (e) {
        e.preventDefault();
        var title = $(e.target).find('[name=title]').val().trim();
        var description = $(e.target).find('[name=description]').val().trim();
        var estimation = $(e.target).find('[name=estimation]').val().trim();

        var isValid = true;
        if (title == '') {
            $(e.target).find('[name=title]').parent().addClass('has-error');
            isValid = false;
        }

        var projectId = this.context.project._id
        var gitlabProjectId = this.context.project.gitlab.id;
        var sprint = Session.get(this.name + 'IssuesPanel') || _options()[0].value;

        var issue = {
            project_id: projectId,
            gitlabProjectId: gitlabProjectId,
            title: title,
            description: description,
            estimation: estimation,
            sprint: sprint,
        };

        $(e.target).find('[type=submit]').blur();

        console.log(issue.sprint);

        if (isValid) {
            Meteor.call('createIssue', issue, function (error, result) {
                //reset the from
                $(e.target).each(function () {
                    this.reset();
                });
                $(e.target).children().removeClass('has-error');
                //set focus on story title textbox
                $(e.target).find('[name=title]').focus();
                $(e.target).find('input, textarea').attr('disabled', false);
            });
            $(e.target).find('input, textarea').attr('disabled', true);
        }
    }
});



var _options = function (panel) {
    var options = [
        /*
        {
            value: 'sandbox',
            name: 'Sandbox',
            help: 'Issues which are not ready for planning',
            panel: panel
        },
        */
        {
            value: 'backlog',
            name: 'Backlog',
            help: 'Issues which are ready for planning',
            panel: panel,
            editable: false
        },
    ];
    var sprints = Sprints.find({}, {
        sort: {
            'gitlab.iid': 1
        }
    }).fetch();
    for (var i in sprints) {
        options.push({
            value: sprints[i].gitlab.iid,
            name: "#" + sprints[i].gitlab.iid + " " + sprints[i].gitlab.title,
            help: 'Issues assigned to the sprint',
            panel: panel,
            editable: true
        });
    }
    return options;
}


var resizePanels = function () {
    if ($('.issues-panel-body').length == 0) {
        return false;
    }
    var freeSpace = $(window).height() - $("html").outerHeight();
    var current = $('.issues-panel-body').height();
    var minHeight = 100;
    $('.issues-panel-body').height(Math.max(minHeight, current + freeSpace));
    var top = $('#logs').offset();
    var bottom = $(window).height();
    return true;
}