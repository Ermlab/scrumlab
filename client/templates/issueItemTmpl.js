Template.issueItemTmpl.tasks = function (id) {
    return Tasks.find({
        issue_id: id
    });
}

Template.issueItemTmpl.events = {
    'click .glyphicon-th-list': function (e) {
        e.preventDefault();
        $('#' + e.currentTarget.parentElement.parentElement.getAttribute("id") + ' .collapse').collapse('toggle');
    }
}