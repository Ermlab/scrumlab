Meteor.methods({

    // an example server function
    'foo': function () {
        if (this.isSimulation) {
            // client code
        }

        if (!this.isSimulation) {
            Server.foo();
        }
    }
});