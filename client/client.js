/* --- client subscribe section ---*/

//subscribe for user profile Data in order to have access to gitlab user
Meteor.subscribe("userData");


Meteor.startup(function () {
    // code to run on server at startup
    Deps.autorun(function() {
        
        var modal = Session.get("modal");
        console.log('modal', modal);
        if (modal !== undefined) {
            OnElementReady('#modal', function(selector) {
                $(selector).modal('show');
                $(selector).on('shown.bs.modal', function (e) {
                    $('[name]:first', selector).focus();
                    console.log('shown', e);
                });
                $(selector).on('hide.bs.modal', function (e) {
                    Session.set("modal", undefined);
                });
            });
        }
        else {
            $('#modal').modal('hide');
        }
    });
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

        var new_issue = BuildAnIssue(issue, gitlabIssue);

        return Issues.insert(new_issue);

    }
}