Template.addIssueTmpl.events = {

    'submit form': function (e) {
        e.preventDefault();


        var projectId = $(e.target).find('[name=projectId]').val().trim();
        var gitlabProjectId = $(e.target).find('[name=glProjectId]').val().trim();

        var issue = {
            project_id: projectId,
            gitlabProjectId: gitlabProjectId,
            title: $(e.target).find('[name=title]').val().trim(),
            description: $(e.target).find('[name=description]').val().trim(),
            teamEst: $(e.target).find('[name=teamEst]').val().trim(),
            estimation: $(e.target).find('[name=estimation]').val().trim(),
        }

        console.log(issue);


        Meteor.call('createIssue', issue, function (error, result) {
            console.log("m_call_err", error);
            console.log("m_call_err", result);

            $(e.target).each(function () {
                this.reset();
            });
            $(e.target).find('[name=title]').focus();

        });

    },

    'click #toogleDetails': function(e) {
        e.preventDefault();

        
        var $this = $(this);
        var $collapse = $this.closest('#addStoryForm').find('.collapse');
        $collapse.collapse('toggle');

/*
        $('#make_hide_button').on('click', function () {
            $('#target_area').hide().find('input, textarea').prop('disabled', true);
        });

        $('#make_show_button').on('click', function () {
            $('#target_area').show().find('input, textarea').prop('disabled', false);
        });*/

    },
}
