XEditableUpdate = function (collection, editable, value) {
    var id = $(editable).data('pk');
    var field = $(editable).data('name');
    if (id && field) {
        var update = {};
        update[field] = value;
        console.log(update);
        collection.update(id, {
            $set: update
        });
        console.log(collection.findOne(id));
        console.log($(editable).text());
    }
}

OnElementReady = function (selector, fcn) {
    if (typeof selector == "string") {
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
    } else {
        console.log("OnElementReady() with object is deprecated");
    }
}

var statusStr = function (status) {
    switch (status) {
    case undefined:
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


jQuery.fn.selectText = function () {
    var doc = document;
    var element = this[0];
    if (doc.body.createTextRange) {
        var range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
    } else if (window.getSelection) {
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }
};