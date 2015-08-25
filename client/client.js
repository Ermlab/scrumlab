/* --- client subscribe section ---*/

//subscribe for user profile Data in order to have access to gitlab user
Meteor.subscribe("userData");


Meteor.startup(function () {
    // code to run on server at startup
    Deps.autorun(function() {
        
        var modal = Session.get("modal");
        if (modal !== undefined) {
            OnElementReady('#editSprintModal', function(selector) {
                $(selector).modal('show');
                $(selector).on('shown.bs.modal', function (e) {
                    $('[name]:first', selector).focus();
                });
                $(selector).on('hide.bs.modal', function (e) {
                    Session.set("modal", undefined);
                });
            });
        }
        else {
            $('#editSprintModal').modal('hide');
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



Client = {

    createIssue: function (issue) {

        var user = Meteor.user();
        if (!user) {
            return;
        }
        function extracted() {
            var gitlabIssue = {
                'project_id': issue.gitlabProjectId,
                'title': issue.title,
                'description': issue.description,
            };
            return gitlabIssue;
        }
        var gitlabIssue = extracted();
        var new_issue = BuildAnIssue(issue, gitlabIssue);

        return Issues.insert(new_issue);

    }
}