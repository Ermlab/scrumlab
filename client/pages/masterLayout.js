Template.masterLayout.events({
    'click .sync': function (e) {
        e.preventDefault();
        if (this.project && this.project._id) {
            $(e.target).addClass('fa-spin');
            Meteor.call('buildReport', this.project._id);
            Meteor.call('refreshProject', this.project._id, function () {
                Meteor.setTimeout(function() {
                    $(e.target).removeClass('fa-spin');
                }, 1000);
            });
        }
    }
});