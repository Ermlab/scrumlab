Assignees = new Meteor.Collection("assignnes");
Stories = new Meteor.Collection("stories");
Tasks = new Meteor.Collection("tasks");

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}