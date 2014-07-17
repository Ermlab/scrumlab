Template.sprints.backlogItems = function () {
    return Stories.find({
        sprint: '0'
    }, {
        sort: {
            position: 1
        }
    });
}

Template.sprints.rendered = function () {
    // Setting sortable property to backlog and sprint containers
    $("#backlogItems, .sprint").sortable({
        stop: function (event, ui) {
            // Getting the element id and containing sprint's id or a backlog container
            var ownerId = ui.item.parent().attr("id");
            var selfId = ui.item.attr("id");
            // If no owner is specified or element was returned to backlog container
            // ownerId is set to 0
            if (ownerId == 'backlogItems') ownerId = '0';
            // Check if the item was dropped back in container it was taken from by
            // comparing parent id with original parent id stored in "ref" variable
            if (ownerId != ui.item.attr("ref")) {
                Stories.update(selfId, {
                    $set: {
                        sprint: ownerId
                    }
                });
                // Getting rid of the doubled item
                ui.item.remove();
            }
        },
        connectWith: "#backlogItems, .sprint",
        cancel: ".sprintTimeMarker"
    }).disableSelection();
    // Setting datepicker property for easy date selection
    $("#datepicker").datepicker();
}

Template.sprintsList.sprints = function () {
    return Sprints.find();
}

Template.sprintsList.assignedItems = function (ownerId) {
    return Stories.find({
        sprint: ownerId
    });
}

Template.sprintsInput.events = {
    'click input.insert': function () {
        var name = document.getElementById("name");
        var date = document.getElementById("datepicker");
        Sprints.insert({
            name: name.value,
            enddate: date.value,
            time: '0',
            status: 'ready'
        });
        name.value = '';
        date.value = '';
    }
}