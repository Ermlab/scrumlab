Assignees = new Meteor.Collection("assignnes");
Stories = new Meteor.Collection("stories");
Tasks = new Meteor.Collection("tasks");

if (Meteor.isClient) {
    Meteor.Router.add({
 	  '/':'dashboard',
      '/projects':'projects',
      '/sprints':'sprints',
      '/taskboard':'taskboard',
      '/backlog':'backlog',
      '/burndown':'burndown'});
}
                      