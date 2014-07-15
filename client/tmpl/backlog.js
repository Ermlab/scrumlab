if (Meteor.isClient) {
    
    Template.user_stories.rendered = function() {
        $.fn.editable.defaults.mode = 'inline';
        $('.story_title, .story_text, .story_hours, .story_assignee').editable({
            success: function(response, newValue) {
            alert(newValue);
            }});
        $('.task_title, .task_text, .task_hours, .task_assignee').editable({
            success: function(response, newValue) {
            alert(newValue);
            }});
    }

    Template.input.events = {
        'click input.insert': function() {
            var name = document.getElementById("name");
            var desc = document.getElementById("description");
            var hours = document.getElementById("time").value;
            var assignee = document.getElementById("assignee_selector");
            var assignee_name = assignee.options[assignee.selectedIndex].text;
            var type = document.getElementById("type_selector");
            var type_name = type.options[type.selectedIndex].text;
            Stories.insert({name: name.value, description: desc.value, time: hours, type: type_name, assignee: assignee_name});
            name.value = '';
            desc.value = '';
        }
    }
    
    Template.user_stories.events = {
        'click .insert_task': function(event) {
            var task = event.currentTarget.parentElement;
            var story = task.parentElement.parentElement.parentElement;
            var story_id = story.getAttribute("id");
            var name = task.getElementsByClassName("t_name")[0].value;
            var desc = task.getElementsByClassName("t_description")[0].value;
            var hours = task.getElementsByClassName("t_time")[0].value;
            var assignee = task.getElementsByClassName("t_assignee_selector")[0];
            var assignee_name = assignee.options[assignee.selectedIndex].text;
            if(name != '') {
                Tasks.insert({story_id: story_id, name: name, description: desc, time: hours, assignee: assignee_name});
                name.value = '';
                desc.value = '';
            }
        },
        
        'dblclick .story_title, dblclick .story_text': function(event) {
            alert("caught story click");
        },
        
        'dblclick .task': function(event) {
            alert("caught task click");
        }
    }
    
    Template.assignees.assignees = function(){
        return Assignees.find();
    }
    
    Template.user_stories.backlog_items = function(){
        return Stories.find();
    }
    
    Template.user_stories.tasks = function(id){
        return Tasks.find({story_id: id});
    } 
    
}