Template.modalEditSprint.sprint = function(sessionVariable) {
    var iid = Session.get(sessionVariable) * 1;
    var sprint = Sprints.findOne({'gitlab.iid':iid});
    console.log(sprint, Sprints.find().fetch());
    return sprint;
}