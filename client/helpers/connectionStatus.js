Template.connectionStatus.isConnected = function () {
    return false;
};

Template.connectionStatus.status = function () {
    return Meteor.status();
}
