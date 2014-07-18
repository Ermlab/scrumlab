Template.navProjectsDropdown.anyProjectIsEnabled = function () {
    return Projects.find({
        enabled: true
    }).count() > 0;
}

Template.navProjectsDropdown.projects = function () {
    return Projects.find();
};