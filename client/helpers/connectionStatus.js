Template.connectionStatus.isConnected = function () {
    return false;
};

Template.connectionStatus.status = function () {
    console.log(Meteor.status())
    return Meteor.status();
}
