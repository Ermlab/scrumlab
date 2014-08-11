// Utility functions for both client and server

var Hide;

Utils = {
    foo: function (x) {
        console.log(x);
        Deprecated("Utils.foo", "Utils.bar");
    }
}

Deprecated = function (oldFcn, newFcn) {
    if (newFcn) {
        hint = " Use " + newFcn + "() instead.";
    }
    console.warn(oldFcn + "() is deprecated." + hint);
}

CheckDate = function (date) {
    // Returns true if given date > current date
    // Assuming string input "MM/DD/YYYY" of jquery datepicker
    var curDate = new Date();
    var splitDate = date.split('/');
    var testDate = new Date(Number(splitDate[2]), Number(splitDate[0]) - 1, Number(splitDate[1]));
    if (testDate > curDate) return true;
    else return false;
}

// Build an mongo Issue from issueProp object, glIssue is gitlab issue object
//it can be little different on client and server
BuildAnIssue = function (issueProp, glIssue) {
    var new_issue = {
        'project_id': issueProp.project_id, //mongo project_id
        'origin': issueProp.origin,
        'created_at': issueProp.created_at,
        'team_estimation': issueProp.teamEst,
        'estimation': issueProp.estimation,
        'gitlab': glIssue //client and server should update this field
    };
    return new_issue;
}