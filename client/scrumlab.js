if (Meteor.isClient) {
    Meteor.Router.add({
 	  '/':'dashboard',
      '/projects':'projects',
      '/sprints':'sprints',
      '/taskboard':'taskboard',
      '/backlog':'backlog',
      '/burndown':'burndown'});
    

    
}
                      