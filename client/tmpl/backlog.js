if (Meteor.isClient) {
    
    Template.user_stories.rendered = function () {
        $("#container").sortable({axis: 'y',
                stop: function (event, ui) {
                    var data = $("#container").sortable("toArray");
                    for(var i = 0; i < data.length; i++){
                        Stories.update(data[i], {$set: {position: i}});
                    }
                }
                });
                $("#container").disableSelection();
        $.fn.editable.defaults.emptytext = 'Brak';
        $.fn.editable.defaults.toggle = 'dblclick';
        $('.story_title, .story_type, .story_text, .story_hours, .story_assignee').editable({
            success: function (response, newValue) {
                var story_id = this.parentElement.getAttribute("id");
                var update_field = {};
                update_field[this.getAttribute("ref")] = newValue;
                Stories.update(story_id, {
                    $set: update_field
                });
            }
        });
        $('.task_title, .task_text, .task_hours, .task_assignee').editable({
            success: function (response, newValue) {
                var task_id = this.parentElement.getAttribute("id");
                var update_field = {};
                update_field[this.getAttribute("ref")] = newValue;
                Tasks.update(task_id, {
                    $set: update_field
                });
            }
        });
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
            var name = task.getElementsByClassName("t_name")[0];
            var desc = task.getElementsByClassName("t_description")[0];
            var hours = task.getElementsByClassName("t_time")[0].value;
            var assignee = task.getElementsByClassName("t_assignee_selector")[0];
            var assignee_name = assignee.options[assignee.selectedIndex].text;
            if(name != '') {
                Tasks.insert({story_id: story_id, name: name.value, description: desc.value, time: hours, assignee: assignee_name});
                name.value = '';
                desc.value = '';
            }
        }
    }
    
    Template.assignees.assignees = function(){
        return Assignees.find();
    }
    
    Template.user_stories.backlog_items = function(){
        return Stories.find({}, {sort: {position: 1}});
    }
    
    Template.user_stories.tasks = function(id){
        return Tasks.find();
    } 
    
}