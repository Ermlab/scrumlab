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

Template.issuesPanel.invalidate = function() {
    return Session.get("invalidatePanels");
}

Template.issuesPanel.destroyed = function () {
    $(window).off('resize');
};

Template.issuesPanel.rendered = function () {
    OnElementReady('.issues-panel-body', function () {
        resizePanels();
        

        $('.issues-list').sortable({
            cancel: "[contenteditable=true], input",
            cursor: "cursor",
            connectWith: ".issues-list",
            placeholder: "sortable-placeholder",
            revert: 50,
            
            start: function (event, ui) {
                //console.log(ui.item.parents('.issues-panel').attr('data-name'));
                var issueId = $('.issue',ui.item).attr('data-id');
                $('.issues-panel').each(function() {
                    var search = $(this).find(ui.item);
                    if (search.length==0) {
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
                    if (id==issue._id) {
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
                    console.log("moved in the same panel");
                }
                else {
                    console.log("moved between panels");
                    // Issue moved between 2 panels
                    if ($(srcPanel).attr('data-id') == $(dstPanel).attr('data-id')) {
                        // both panels display the same sprint
                        
                        // move original issue b back to the source panel but in a correct position
                        if (predecessor===undefined) {
                            // new item is first on the list
                            console.log('insert at the begg');
                            $(this).prepend(ui.item);
                        }
                        else {
                            $('.issue[data-id={0}]'.format(predecessor),this).after(ui.item);
                        }
                    }
                }
                
                // show duplicated issue
                $('.issue.duplicate').removeClass('duplicate');
            
                if (sprint) {
                    // Add issue to sprint
                    console.log("adding to sprint ", issueId, sprint.gitlab.title);
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
                    console.log("removing from sprint ", issueId);
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
        newIssue.find('input[name=title]').focus();
    },

    'click .new-sprint': function (e) {
        console.log('new sprint in', this.context.project._id);
        Session.set('modal', {
            template: 'modalEditSprint',
            data: this.context.project._id + ""
        });
        Session.set("newSprintTarget", this.name + 'IssuesPanel');
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
            estimation: estimation,
        };
        
        var iid = Session.get(this.name + 'IssuesPanel');
        var sprint = Sprints.findOne({'gitlab.iid':iid*1});
        if (sprint!==undefined) {
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
            _id: 'backlog',
            name: 'Backlog',
            help: 'Issues which are ready for planning',
            panel: panel,
            editable: false
        },
    ];
    var sprints = Sprints.find({
        'gitlab.state': 'active'
    }, {
        sort: {
            'gitlab.iid': 1
        }
    }).fetch();
    for (var i in sprints) {
        options.push({
            value: sprints[i].gitlab.iid,
            _id: sprints[i]._id,
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