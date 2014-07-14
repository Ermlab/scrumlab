if (Meteor.isServer) {
    
    // Połączenie z GitLabem
    var gitlab = new GitLab({
        url:   'http://gitlab.ermlab.com/',
        token: 'niMspAWMEkdpHSnsC2E4'});

    // Users
    gitlab.users.all(function(users) {
        for (var i = 0; i < users.length; i++) {
            //console.log("#" + users[i].id + ": " + users[i].email + ", " + users[i].name + ", " + users[i].created_at);
            console.log(users[i]);
        }
    });
      
    gitlab.users.session("paul.dawidczyk@gmail.com","32360016",function(data){
        console.log(data);
    });
    
}