Template.issuesListTmpl.events = {
    'click .glyphicon-th-list': function (e) {
        e.preventDefault();
        $('#' + e.currentTarget.parentElement.parentElement.getAttribute("id") + ' .collapse').collapse('toggle');
    }
}