Template.masterLayout.events({
    'click .sync': function (e) {
        if (this.project && this.project._id) {
            $(e.target).addClass('fa-spin');
            Meteor.call('refreshProject', this.project._id, function () {
                Meteor.setTimeout(function() {
                    $(e.target).removeClass('fa-spin');
                }, 1000);
                
            });
        }
    }
});