Template.projectSprints.rendered = function () {
    // Setting sortable property to sprintlist container
    $("#sprintBody").sortable({
        axis: 'y',
        // Saving new sprints order in database
        stop: function (event, ui) {
            var data = $("#sprintBody").sortable("toArray");
            for (var i = 0; i < data.length; i++) {
                Sprints.update(data[i], {
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
            var previousId = ui.item.attr("ref");
            // If no owner is specified or element was returned to backlog container ownerId is set to 0
            if (ownerId == 'backlogItems') ownerId = '0';
            // If no previous owner present, previousId is set to 0
            if (typeof (previousId) == 'undefined') previousId = '0';
            // Check if the item was dropped back in container it was taken from by
            // comparing parent id with original parent id stored in "ref" variable
            if (ownerId != previousId) {
                // Check if owner is actually a sprint
                if (ownerId != 0) {
                    Issues.update(selfId, {
                        $set: {
                            sprint: ownerId
                        }
                    });
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
                } else {
                    // If ownerId = 0, the field sprint is removed, resulting in element being unassigned
                    // no time estimate recalculation needed
                    Issues.update(selfId, {
                        $unset: {
                            sprint: ""
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

Template.projectSprintsList.assignedItems = function (ownerId) {
    return Issues.find({
        sprint: ownerId
    }, {
        sort: {
            position: 1
        }
    });
}

Template.projectSprintsInput.events = {
    'click input.insert': function (event) {
        var name = document.getElementById("name");
        var date = document.getElementById("datepicker");
        var projectId = document.getElementById("projectId").getAttribute("ref");
        Sprints.insert({
            name: name.value,
            enddate: date.value,
            project: projectId,
            time: '0',
            status: 'ready'
        });
        name.value = '';
        date.value = '';
    }
}