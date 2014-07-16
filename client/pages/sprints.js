Template.sprints.issues = function(){
    return Stories.find({}, {sort: {position: 1}});
}