Template.navProjectsDropdown.anyProjectIsEnabled = function () {
    return Projects.find({
        enabled: true
    }).count() > 0;
}

Template.navProjectsDropdown.projectNames = function () {
    return Projects.find({}, {
        fields: {
            'gitlab.id': 1,
            'gitlab.name': 1,
            'gitlab.name_with_namespace': 1
        }
    });

};