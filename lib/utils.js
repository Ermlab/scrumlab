// Utility functions for both client and server

//log4js.enableSilos('');


if (Meteor.isServer) {
    logger = log4js.getLogger();
}

var Hide;

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}


Utils = {
    foo: function (x) {
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

CurrDate = function () {

    // we can make just like this || return moment(Date()).format("DD/MM/YYYY HH:mm:ss");

    var nowDate = new Date();

    var month = (nowDate.getMonth() + 1).toString();

    var day = nowDate.getDate().toString();

    var hours = nowDate.getHours().toString();

    var minutes = nowDate.getMinutes().toString();

    var seconds = nowDate.getSeconds().toString();

    if (month < 10) {
        month = "0" + month;
    }
    if (day < 10) {
        day = "0" + day;
    }
    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }

    return day + "/" + month + "/" + nowDate.getFullYear() + " " + hours + ":" + minutes + ":" + seconds;

}

// Build an mongo Issue from issueProp object, glIssue is gitlab issue object
//it can be little different on client and server
BuildAnIssue = function (issueProp, glIssue) {
    var new_issue = {
        'project_id': issueProp.project_id, //mongo project_id
        'origin': issueProp.origin,
        'created_at': issueProp.created_at,
        //'team_estimation': issueProp.teamEst,
        //'sprint': issueProp.sprint,
        'estimation': issueProp.estimation,
        'gitlab': glIssue,
        'weight': glIssue.iid
    };
    return new_issue;
}

AddPlaceholderTaskToIssue = function (issueId) {
    var issue = Issues.findOne(issueId);
    if (issue && issue.project_id) {
        return Tasks.insert({
            project_id: issue.project_id,
            issue_id: issueId,
            name: 'complete user story',
            status: 'toDo',
            placeholder: true,
            estimation: issue.estimation
        });
    }
}

