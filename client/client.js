/* --- client subscribe section ---*/

//subscribe for user profile Data in order to have access to gitlab user
Meteor.subscribe("userData");


live = function() {
    $(document.body).on('change', '*[contenteditable^="true"]', function () {
        alert('on',$(this));
    });
}


Meteor.startup(function () {
    // code to run on server at startup

});


/*--- Meteor system hooks ---*/
Meteor.loginWithGitlabAccount = function (email, password, serverUrl, callback) {
    var loginRequest = {
        email: email,
        password: password,
        gitlabServerUrl: serverUrl
    };

    Accounts.callLoginMethod({
        methodArguments: [loginRequest],
        userCallback: callback
    });
};


//helper function for showing things (objects etc.) in broweser console, 
//it can be used in templates: {{ conlog user}}
Handlebars.registerHelper('conlog', function (thing) {

    console.log("Template log:");
    console.log(thing);
});


Client = {

    createIssue: function (issue) {

        var user = Meteor.user();
        if (!user) {
            return;
        }


        var gitlabIssue = {
            'project_id': issue.gitlabProjectId,
            'title': issue.title,
            'description': issue.description,
        };


        /*   var new_issue = {
            'project_id': issue.project_id,
            'gitlab': gitlabIssue,
            'origin': user.origin,
            'created_at' : issue.created_at,
            'team_estimation': issue.teamEst,
            'estimation': issue.estimation,
        };*/


        var new_issue = BuildAnIssue(issue, gitlabIssue);

        console.log(' issue on client \n', new_issue);
        return Issues.insert(new_issue);

    }
}