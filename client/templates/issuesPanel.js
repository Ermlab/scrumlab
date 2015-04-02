Template.issuesPanel.selectedSprint = function () {
    var options = _options(this.name);
    var selected = Session.get(this.name + "IssuesPanel") || options[0].value;
    for (var i = 0; i < options.length; i++) {
        if (options[i].value == selected) {
            return options[i];
        }
    }
}

Template.issuesPanel.panelStats = function (sprintId) {
    var openCount = 0;
    var openEstimation = 0;
    var totalEstimation = 0;

    var sprint = Sprints.findOne(sprintId);
    if (sprint) {
        // sprint
        var issues = Issues.find({
            'gitlab.milestone.id': sprint.gitlab.id
        }).fetch();
    } else {
        // backlog
        var issues = Issues.find({
            'gitlab.milestone.id': {
                $exists: false
            }
        }).fetch();
    }

    for (var i = 0; i < issues.length; i++) {

        var total = 0;
        var tasks = Tasks.find({
            issue_id: issues[i]._id
        }).fetch();

        for (var j = 0; j < tasks.length; j++) {
            if (tasks[j].estimation) {
                total += tasks[j].estimation * 1;

            }

        }

        if (issues[i].gitlab.state == 'opened') {
            openCount++;
            if (!(isNaN(total)))
                openEstimation += total;
        }


        if (!(isNaN(total)))
            totalEstimation += total;
    }


    return {
        openCount: openCount,
        totalCount: issues.length,
        openEstimation: openEstimation,
        totalEstimation: totalEstimation
    }
}

Template.issuesPanel.issues = function (sprint) {
    var sort = {
        sort: {
            weight: 1
        }
    };

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
            }, sort);
            break;
        default:
            return Issues.find({
                'gitlab.milestone.iid': sprint * 1
            }, sort);
    }
}

Template.issuesPanel.created = function () {
    $(window).resize(function () {
        resizePanels();
    });
}

Template.issuesPanel.invalidate = function () {
    return Session.get("invalidatePanels");
}

Template.issuesPanel.destroyed = function () {
    $(window).off('resize');
};

Template.issuesPanel.rendered = function () {

    Session.set("showActive",null);

    OnElementReady('.issues-panel-body', function () {
        resizePanels();


        $('.issues-list').sortable({
            cancel: "textarea, input, .new-issue-wrapper",
            cursor: "cursor",
            connectWith: ".issues-list",
            placeholder: "sortable-placeholder",
            revert: 50,

            start: function (event, ui) {
                var issueId = $('.issue', ui.item).attr('data-id');
                $('.issues-panel').each(function () {
                    var search = $(this).find(ui.item);
                    if (search.length == 0) {
                        // found item duplicate on the other (non-source) panel
                        $(this).find('.issue[data-id={0}]'.format(issueId)).addClass('duplicate');
                    }
                });
            },
            stop: function (event, ui) {
                var srcPanel = $(this).parents('.issues-panel')[0];
                var dstPanel = $(ui.item[0]).parents('.issues-panel')[0];

                var issueId = $('.issue', ui.item).attr('data-id');
                var sprintId = $(dstPanel).attr('data-id');

                var issue = Issues.findOne(issueId);
                var sprint = Sprints.findOne(sprintId);

                // Reweight issued based on positions in the destination panel
                var last;
                var predecessor;
                $('.issue', dstPanel).not('.duplicate').each(function (i) {
                    var id = $(this).attr('data-id');
                    if (id == issue._id) {
                        predecessor = last;
                    }
                    Issues.update(id, {
                        $set: {
                            weight: i
                        }
                    });
                    last = id;
                });

                if (srcPanel == dstPanel) {
                    // Issue moved inside one panels
                } else {
                    // Issue moved between 2 panels
                    if ($(srcPanel).attr('data-id') == $(dstPanel).attr('data-id')) {
                        // both panels display the same sprint

                        // move original issue b back to the source panel but in a correct position
                        if (predecessor === undefined) {
                            // new item is first on the list
                            $(this).prepend(ui.item);
                        } else {
                            $('.issue[data-id={0}]'.format(predecessor), this).parent().after(ui.item);
                        }
                    }
                }

                // show duplicated issue
                $('.issue.duplicate').removeClass('duplicate');

                if (sprint) {
                    // Add issue to sprint
                    Issues.update(issue._id, {
                        $set: {
                            'gitlab.milestone': {
                                id: sprint.gitlab.id,
                                iid: sprint.gitlab.iid
                            },
                            weight: ui.item.index()
                        }
                    });

                } else {
                    // Remove issue from sprint
                    Issues.update(issueId, {
                        $unset: {
                            'gitlab.milestone.id': "",
                            'gitlab.milestone.iid': "",
                        },
                    });
                }

                // Push issue if it has been moved to another sprint
                if ($(srcPanel).attr('data-id') != $(dstPanel).attr('data-id')) {
                    Meteor.call('pushIssue', issueId);
                }

            }
        });
    });
}

Template.issuesPanel.events({
    'click .edit-sprint': function (e) {
        e.preventDefault();
        Session.set('modal', {
            template: 'modalEditSprint',
            data: this.name + 'IssuesPanel'
        });
    },

});
Template.planBoard.events({
    'change .hide-completed input' : function (e) {
        e.preventDefault();
        Session.set("showActive",e.target.checked);
    }
});

Template.issuesPanelDropdown.options = function () {
    var options = 0;
    if (Session.get("showActive")) {
        options = _options(this.name);
    }
    else {
        options = _activeOptions(this.name);
    }

    return options;
}
var _options = function (panel) {
    var sprints = Sprints.find({
        'gitlab.state': 'active',
    }, {
        sort: {
            'status' : "inProgress",
            'gitlab.iid': 1,
        }
    }).fetch();
    return SprintSelectOptions(sprints, panel);
}

var _activeOptions = function (panel) {
    var sprints = Sprints.find({
        'gitlab.state': 'active',
        'status': { "$in":['inPlanning','inProgress']}
    }, {
        sort: {
            'status' : "inProgress",
            'gitlab.iid': 1
        }
    }).fetch();
    return SprintSelectOptions(sprints, panel);
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
        newIssue.find('input[name=title]').focus();
    },

    'click .new-sprint': function (e) {
        Session.set('modal', {
            template: 'modalEditSprint',
            data: this.context.project._id + ""
        });
        Session.set("newSprintTarget", this.name + 'IssuesPanel');
    },

    'click .work-sprint': function (e) {
        var iid = Session.get(this.name + 'IssuesPanel');
        Session.set('workboardSprint', iid);
        Router.go('workBoard', {id: this.context.project._id});
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

        var issue = {
            project_id: projectId,
            gitlabProjectId: gitlabProjectId,
            title: title,
            description: description,
            estimation: estimation
        };

        var iid = Session.get(this.name + 'IssuesPanel');
        var sprint = Sprints.findOne({
            'gitlab.iid': iid * 1
        });
        if (sprint !== undefined) {
            issue.sprint = sprint._id;
        }

        $(e.target).find('[type=submit]').blur();

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
                $('.new-issue [name=title]').focus();
            });
            $(e.target).find('input, textarea').attr('disabled', true);
        }
    }
});


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