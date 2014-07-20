//TODO: change to publish subscribe model
/*
Template.navProjectsDropdown.projects = function () {
    return Projects.find();
    
};
*/


Template.navProjectsDropdown.projectNames = function () {
    return Projects.find({}, {
        fields: {
            'gitlab.id': 1,
            'gitlab.name': 1,
            'gitlab.name_with_namespace': 1
        }
    });

};