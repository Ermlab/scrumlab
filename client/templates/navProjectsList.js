Template.navProjectsList.anyProjectIsEnabled = function () {
    return Projects.find({
        enabled: true
    }).count() > 0;
}

Template.navProjectsList.projectNames = function () {
    //TODO: refactor, fields are not needed on the client side (PG)
    return Projects.find({'member_ids.id': Meteor.userId()}, {
        fields: {
            '_id': 1,
            'gitlab.name': 1,
            'gitlab.name_with_namespace': 1,
            'enabled': 1
        }
    });

};

