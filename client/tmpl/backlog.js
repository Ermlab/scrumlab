if (Meteor.isClient) {
    
    Template.input.events = {
        'click input.insert': function() {
            var name = document.getElementById("name");
            var desc = document.getElementById("description");
            var hours = document.getElementById("time").value;
            var assignee = document.getElementById("assignee_selector");
            var assignee_name = assignee.options[assignee.selectedIndex].text;
            Stories.insert({name: name.value, description: desc.value, time: hours, assignee: assignee_name});
            name.value = '';
            desc.value = '';
        }
    }
    
    Template.user_stories.events = {
        'click .insert_task': function(event) {
            alert(event.target.id);
        }
    }
    
    Template.assignees.assignees = function(){
        return Assignees.find();
    }
    
    Template.user_stories.backlog_items = function(){
        return Stories.find();
    }
    
    Template.tasks.tasks = function(){
        return Tasks.find();
    }
    
}