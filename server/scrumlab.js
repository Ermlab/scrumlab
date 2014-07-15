Assignees = new Meteor.Collection("assignees");
Stories = new Meteor.Collection("stories");
Tasks = new Meteor.Collection("tasks");

var Fiber = Npm.require('fibers');

if (Meteor.isServer) {
  Meteor.startup(function () {
    
    // Połączenie z GitLabem
    var gitlab = new GitLab({
        url:   'http://gitlab.ermlab.com/',
        token: 'niMspAWMEkdpHSnsC2E4'});

    // Users
    gitlab.users.all(function(users) {
        Fiber(function() {
              for (var i = 0; i < users.length; i++) {
                Assignees.update({name: users[i].username}, {name: users[i].username, fullname: users[i].name }, {upsert: true});
              }
        }).run();
    });
      
    gitlab.users.session("paul.dawidczyk@gmail.com","32360016",function(data){
        //console.log(data);
    });
      
  });
}