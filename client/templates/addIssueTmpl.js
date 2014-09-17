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

        console.log("Witam");

        Meteor.call('createIssue', issue, function (error, result) {
            console.log("m_call_err", error);
            console.log("m_call_err", result);

            //reset the from
            $(e.target).each(function () {
                this.reset();
            });
            //set focus on story title textbox
            $(e.target).find('[name=title]').focus();
            console.log('on');
            $(e.target).find('input, textarea').attr('disabled', true);
        });
        console.log('off');
        $(e.target).find('input, textarea').attr('disabled', false);

    },

    'keyup #teamEstimation': function (event) {
        var estimation = $(event.target).val().trim();
        var values = estimation.split(/[\s,;]+/);
        var sum = 0;
        var count = 0;
        _.each(values, function (value) {
            if (!isNaN(value) && (value != '')) {
                sum = sum + parseInt(value);
                count++;
            }
        });
        var mean = Math.floor(sum/count);
        if(isNaN(mean)) mean = 0;
        document.getElementById('teamEstimationMarker').innerHTML = mean;
    },

    'click #toogleDetails': function (e) {
        e.preventDefault();

        console.log('click');


        //$('#addStoryForm .collapse').find('input, textarea, button, select').prop("disabled", false);

        $('#addStoryForm .collapse').collapse('toggle');

    },
}