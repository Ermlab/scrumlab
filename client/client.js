/* --- client subscribe section ---*/

//subscribe for user profile Data in order to have access to gitlab user
Meteor.subscribe("userData");


Meteor.startup(function () {
    // code to run on server at startup
});


/*--- Meteor system hooks ---*/
Meteor.loginWithGitlabAccount = function (email, password, callback) {
    var loginRequest = {
        email: email,
        password: password
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