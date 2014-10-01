Meteor.startup(function () {
    Tasks.find().observeChanges({
        added: function (id, fields) {
            updateTaskEstimation(id, fields);
        },

        changed: function (id, fields) {
            updateTaskEstimation(id, fields);
        }
    });
});


var updateTaskEstimation = function (id, fields) {
    if (fields.name) {
        var name = fields.name;
        var parts = name.split(' ');
        var est = parseFloat(parts[parts.length - 1]);
        if (!isNaN(est) && parts.length > 1 && est > 0) {
            parts.pop();
            name = parts.join(' ');
            Tasks.update(id, {
                $set: {
                    name: name,
                    estimation: est
                }
            });
        }
    }
}