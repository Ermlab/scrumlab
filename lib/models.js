ProjectModel = {
    getIssuesInSprint: function (projectId, sprintId) {
        var issues;
        var sprint = Sprints.findOne(sprintId);
        if (sprintId == 'backlog') {
            issues = Issues.find({
                project_id: projectId,
                'gitlab.milestone.id': {
                    $exists: false
                }
            }).fetch();
        } else if (sprint) {
            issues = Issues.find({
                project_id: projectId,
                'gitlab.milestone.id': sprint.gitlab.id
            }).fetch();
        }
        return issues;
    }
};

IssueModel = {
    getTasksInIssues: function (issues) {
        var issue_ids = [];
        for (var i = 0; i < issues.length; i++) {

            if (issues[i]._id !== undefined) {
                issue_ids.push(issues[i]._id);
            } else {
                issue_ids.push(issues[i]);
            }
        }
        // get tasks in the sprint
        var tasks = Tasks.find({
            'issue_id': {
                $in: issue_ids
            }
        }).fetch();

        return tasks;
    }
};

TaskModel = {
    getTotalTaskEstimates: function (tasks) {
        var result = {
            total: 0
        };
        for (var j = 0; j < tasks.length; j++) {
            if (tasks[j].estimation) {
                var status = tasks[j].status;
                var val = tasks[j].estimation * 1;
                if (result[status]) {
                    result[status] += val;
                }
                else {
                    result[status] = val;
                }
                result.total += val;
            }
        }
        return result;
    }
}