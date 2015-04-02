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
        name = fields.name;
        setEstimation(id,findEstimation());

    }
}

function findEstimation() {
    if (name.match(/~[0-9][0-9]*/)) {
        var estFound = name.replace(/^((?!~[0-9]).)*$/, "");
        est = estFound.match(/\d+/);
        return (est);
    } else
        return (null);

}

function setEstimation(id,est) {
    if ((est != null) && (name.replace(/~[0-9][0-9]*/, "") != "")) {
        Tasks.update(id, {
            $set: {
                name: name.replace(/~[0-9][0-9]*/, ""),
                estimation: est
            }
        });
    }
}