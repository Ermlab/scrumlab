Template.navProjectsDropdown.anyProjectIsEnabled = function () {
    return Projects.find({
        enabled: true
    }).count() > 0;
}

Template.navProjectsDropdown.projectNames = function () {
    //TODO: refactor, fields are not needed on the client side (PG)
    return Projects.find({}, {
        fields: {
            '_id': 1,
            'gitlab.name': 1,
            'gitlab.name_with_namespace': 1
        }
    });

};