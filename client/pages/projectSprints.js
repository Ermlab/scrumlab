Template.projectSprints.backlogItems = function () {
    return Issues.find({
        sprint: '0'
    }, {
        sort: {
            position: 1
        }
    });
}

Template.projectSprints.rendered = function () {
    // Setting sortable property to sprintlist container
    $("#sprintBody").sortable({
        axis: 'y',
        // Saving new sprints order in database
        stop: function (event, ui) {
            var data = $("#sprintBody").sortable("toArray");
            for (var i = 0; i < data.length; i++) {
                Issues.update(data[i], {
                    $set: {
                        position: i
                    }
                });
            }
        }
    });
    // Setting sortable property to backlog and sprint containers
    $("#backlogItems, .sprint").sortable({
        stop: function (event, ui) {
            // Getting the element id and containing sprint's id (or a backlogItems container)
            var ownerId = ui.item.parent().attr("id");
            var selfId = ui.item.attr("id");
            // If no owner is specified or element was returned to backlog container ownerId is set to 0
            if (ownerId == 'backlogItems') ownerId = '0';
            // Check if the item was dropped back in container it was taken from by
            // comparing parent id with original parent id stored in "ref" variable
            if (ownerId != ui.item.attr("ref")) {
                Issues.update(selfId, {
                    $set: {
                        sprint: ownerId
                    }
                });
                // Check if owner is actually a sprint
                if (ownerId != 0) {
                    // Recalculate the time estimate of a sprint 
                    var sum = 0;
                    var data = Issues.find({
                        sprint: ownerId
                    }).fetch();
                    while (data.length > 0) sum += parseInt(data.pop().time);
                    // Update the time estimate
                    Sprints.update(ownerId, {
                        $set: {
                            time: sum
                        }
                    });
                }
                // Get previous owner id to allow time estimate recalculation
                var previousOwnerId = ui.item.attr("ref");
                // Check if previous owner is actually a sprint
                if (previousOwnerId != 0) {
                    // Recalculate the time estimate of a sprint 
                    var sum = 0;
                    var data = Issues.find({
                        sprint: previousOwnerId
                    }).fetch();
                    while (data.length > 0) sum += parseInt(data.pop().time);
                    // Update the time estimate
                    Issues.update(previousOwnerId, {
                        $set: {
                            time: sum
                        }
                    });
                }
                // Getting rid of duplicated ui item
                ui.item.remove();
            }
        },
        connectWith: "#backlogItems, .sprint",
        cancel: ".sprintTimeMarker, .sprintInfo"
    }).disableSelection();
    // Setting datepicker property for easy date selection
    $("#datepicker").datepicker();
}

Template.projectSprintsList.sprints = function () {
    return Sprints.find({}, {
        sort: {
            position: 1
        }
    });
}

Template.projectSprintsList.assignedItems = function (ownerId) {
    return Issues.find({
        sprint: ownerId
    });
}

Template.projectSprintsInput.events = {
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