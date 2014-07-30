Template.issueItemTmpl.tasks = function (id) {
    return Tasks.find({
        issue_id: id
    });
}