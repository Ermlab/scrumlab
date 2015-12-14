OnElementReady = function (selector, fcn) {
    if ($(selector).length) {
        fcn(selector);
    } else {
        var id = Meteor.setInterval(function () {
            if ($(selector).length) {
                Meteor.clearInterval(id);
                fcn(selector);
            }
        }, 100);
    }
}

var statusStr = function (status) {
    switch (status) {
        case undefined:
            return 'in planning';
        case 'inPlanning':
            return 'in planning';
        case 'inProgress':
            return 'in progress';
        default:
            return status;
    }
}

SprintSelectOptions = function (sprints, panel) {
    var options = [
        {
            value: 'backlog',
            _id: 'backlog',
            name: 'Backlog',
            help: 'Issues which are ready for planning',
            panel: panel,
            editable: false,
        },
    ];
    for (var i in sprints) {
        options.push({
            value: sprints[i].gitlab.iid,
            _id: sprints[i]._id,
            name: "#" + sprints[i].gitlab.iid + " " + sprints[i].gitlab.title,
            help: 'Issues assigned to the sprint',
            panel: panel,
            editable: true,
            status_str: ' (' + statusStr(sprints[i].status) + ')'
        });
    }
    return options;
}