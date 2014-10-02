var sprintChart;

function getChartData(labels, plannedLine, doneLine) {
    var data = {
        labels: labels,
        datasets: [
            {
                label: "Planned",
                fillColor: "rgba(220,220,220,0.5)",
                strokeColor: "rgba(220,220,220,0.8)",
                highlightFill: "rgba(220,220,220,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: plannedLine
                },
            {
                label: "Done",
                fillColor: "rgba(151,187,205,0.5)",
                strokeColor: "rgba(151,187,205,0.8)",
                highlightFill: "rgba(151,187,205,0.75)",
                highlightStroke: "rgba(151,187,205,1)",
                data: doneLine
                }
            ]
    }

    var options = {
        //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
        scaleBeginAtZero: true,

        //Boolean - Whether grid lines are shown across the chart
        scaleShowGridLines: true,

        //String - Colour of the grid lines
        scaleGridLineColor: "rgba(0,0,0,.05)",

        //Number - Width of the grid lines
        scaleGridLineWidth: 1,

        //Boolean - If there is a stroke on each bar
        barShowStroke: true,

        //Number - Pixel width of the bar stroke
        barStrokeWidth: 1,

        responsive: true,

        //Number - Spacing between each of the X value sets
        barValueSpacing: 5,

        //Number - Spacing between data sets within X values
        barDatasetSpacing: 0,

        //String - A legend template
        legendTemplate: "<span style=\"background-color: rgba(220,220,220,0.5); width: 100px;height: 20px;display: block;font-family: &quot;Helvetica Neue&quot;;color: #666;text-align: center;\">Planned</span><span style=\"background-color:rgba(151,187,205,0.5); width: 100px;height: 20px;display: block;font-family: &quot;Helvetica Neue&quot;;color: #666;text-align: center;\">Done</span>"
    };

    return {
        data: data,
        options: options
    }
}

Template.reportsBoardSprintChart.draw = function () {
    
    if (this.project && this.project.reports) {
        var reports = this.project.reports;
        var sprintIid = Session.get('reportsSprint') || 'backlog';
        var due_date;
        var sprint = Sprints.findOne({
            project_id: this.project._id,
            'gitlab.iid': sprintIid
        });
        var startDate = sprint ? sprint.start_date : undefined;
        var endDate = sprint ? sprint.gitlab.due_date : undefined;
        var startMoment = moment(startDate || 0);
        var endMoment = moment(endDate);
        
        //console.log(startMoment.toString(), endMoment.toString());
        
        

        OnElementReady('#sprintChart', function (selector) {
            var plannedLine = [];
            var doneLine = [];
            var labels = [];

            _.each(reports, function (data, key) {
                labels.push(key);
                var total = data[sprintIid].total;
                doneLine.push(total - data[sprintIid].done);
                plannedLine.push(total);
            });

            var chart = getChartData(labels, plannedLine, doneLine);

            var ctx = $(selector + ' canvas')[0].getContext("2d");
            if (sprintChart) {
                sprintChart.destroy();
            }
            sprintChart = new Chart(ctx).Bar(chart.data, chart.options);
            var legend = sprintChart.generateLegend();
            $(selector + '.legend').html(legend);
        });
    }
}

Template.reportsBoardSprintDropdown.options = function () {
    var sprints = Sprints.find().fetch();
    return SprintSelectOptions(sprints);
}

Template.reportsBoardSprintDropdown.selectedSprint = function () {
    return Session.get('reportsSprint');
}

Template.reportsBoardSprintDropdown.events({
    'change select': function (e) {
        Session.set('reportsSprint', $(e.target).val() * 1);
    }
});



/*

Template.projectVelocity.rendered = function () {}

/*
    Meteor.setTimeout(function () {
            var data = {
                labels: [],
                datasets: [
                    {
                        label: "Planned",
                        fillColor: "rgba(220,220,220,0.5)",
                        strokeColor: "rgba(220,220,220,0.8)",
                        highlightFill: "rgba(220,220,220,0.75)",
                        highlightStroke: "rgba(220,220,220,1)",
                        data: []
            },
                    {
                        label: "Done",
                        fillColor: "rgba(151,187,205,0.5)",
                        strokeColor: "rgba(151,187,205,0.8)",
                        highlightFill: "rgba(151,187,205,0.75)",
                        highlightStroke: "rgba(151,187,205,1)",
                        data: []
        }]
            };

            var totalTimeProject = 0;

            _.each(sprints, function (spr) {

                var issues = Issues.find({
                    estimation: {
                        $exists: true
                    },
                    sprint: spr._id

                }).fetch();
                console.log('issues',issues);

                var closed = Issues.find({
                    $and: [{
                        estimation: {
                            $exists: true
                        }
            }, {
                        estimation: {
                            $ne: ''
                        }
            }, {
                        sprint: spr._id
            }, {
                        'gitlab.state': 'closed'
            }]

                }).fetch();
                console.log('closed',closed);

                var totalTime = _.reduce(_.pluck(issues, 'estimation'), function (sum, val) {
                    return sum + parseInt(val);
                }, 0);

                // sumowanie czasu dla wszystkich issues
                totalTimeProject += totalTime;

                // sumowanie czasu wszystkich skonczonych
                var doneTime = _.reduce(_.pluck(closed, 'estimation'), function (sum, val) {
                    return sum + parseInt(val);
                }, 0);

                var sprintName = spr.name;

                // pierwszy punkt zaczepienia - calkowita liczba godzin w sprincie
                // data.datasets[0] - planned
                // data.datasets[1] - done
                data.datasets[0].data.push(totalTime);

                if (!(_.contains(data.labels, sprintName))) {
                    data.labels.push(sprintName);
                }

                data.datasets[1].data.push(doneTime);

            });

            var options = {
                //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
                scaleBeginAtZero: true,

                //Boolean - Whether grid lines are shown across the chart
                scaleShowGridLines: true,

                //String - Colour of the grid lines
                scaleGridLineColor: "rgba(0,0,0,.05)",

                //Number - Width of the grid lines
                scaleGridLineWidth: 1,

                //Boolean - If there is a stroke on each bar
                barShowStroke: true,

                //Number - Pixel width of the bar stroke
                barStrokeWidth: 1,

                responsive: true,

                //Number - Spacing between each of the X value sets
                barValueSpacing: 5,

                //Number - Spacing between data sets within X values
                barDatasetSpacing: 0,

                //String - A legend template
                legendTemplate: "<span style=\"background-color: rgba(220,220,220,0.5); width: 100px;height: 20px;display: block;font-family: &quot;Helvetica Neue&quot;;color: #666;text-align: center;\">Planned</span><span style=\"background-color:rgba(151,187,205,0.5); width: 100px;height: 20px;display: block;font-family: &quot;Helvetica Neue&quot;;color: #666;text-align: center;\">Done</span>"
            };

            var ctx = document.getElementById("myChart").getContext("2d");

            var barChart = new Chart(ctx).Bar(data, options);

            var legend = barChart.generateLegend();

            $("#legend").html(legend);

            // ////// ///// ///// /////// //////// //
            // Second chart named project burndown //
            // ////// ///// ///// /////// //////// //

            var dataLine = {
                labels: [],
                datasets: [
                    {
                        label: "The estimated end of the project",
                        fillColor: "rgba(220,220,220,0.2)",
                        strokeColor: "rgba(220,220,220,1)",
                        pointColor: "rgba(220,220,220,1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(220,220,220,1)",
                        data: []
        },
                    {
                        label: "Progress",
                        fillColor: "rgba(151,187,205,0.2)",
                        strokeColor: "rgba(151,187,205,1)",
                        pointColor: "rgba(151,187,205,1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(151,187,205,1)",
                        data: []
        },
                    {
                        data: [0]
                    }
    ]
            };

            var optionsLine = {

                ///Boolean - Whether grid lines are shown across the chart
                scaleShowGridLines: true,

                //String - Colour of the grid lines
                scaleGridLineColor: "rgba(0,0,0,.05)",

                //Number - Width of the grid lines
                scaleGridLineWidth: 1,

                //Boolean - Whether the line is curved between points
                bezierCurve: false,

                responsive: true,

                //Number - Tension of the bezier curve between points
                bezierCurveTension: 0.7,

                //Boolean - Whether to show a dot for each point
                pointDot: true,

                //Number - Radius of each point dot in pixels
                pointDotRadius: 4,

                //Number - Pixel width of point dot stroke
                pointDotStrokeWidth: 1,

                //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
                pointHitDetectionRadius: 20,

                //Boolean - Whether to show a stroke for datasets
                datasetStroke: true,

                //Number - Pixel width of dataset stroke
                datasetStrokeWidth: 2,

                //Boolean - Whether to fill the dataset with a colour
                datasetFill: true,

                //String - A legend template
                legendTemplate: "</span><span style=\"background-color: rgba(220,220,220,0.5); width: 200px;height: 20px;display: block;font-family: &quot;Helvetica Neue&quot;;color: #666;text-align: center;\">Estimated time to end project</span><span style=\"background-color:rgba(151,187,205,0.5); width: 200px;height: 20px;display: block;font-family: &quot;Helvetica Neue&quot;;color: #666;text-align: center;\">In progress</span>"

            };

            var sprintBurndown = Sprints.find({
                'status': 'in progress'
            }).fetch();

            var issues = Issues.find({
                estimation: {
                    $exists: true
                },
                sprint: sprintBurndown[0]._id

            }).fetch();

            var closed = Issues.find({
                $and: [{
                    estimation: {
                        $exists: true
                    }
        }, {
                    estimation: {
                        $ne: ''
                    }
        }, {
                    sprint: sprintBurndown[0]._id
        }, {
                    'gitlab.state': 'closed'
        }]

            }).fetch();

            var totalTime = 0;

            var daysBetween = 0;

            var startDate = moment([sprintBurndown[0].status_changed.toString().substring(6, 10), sprintBurndown[0].status_changed.toString().substring(3, 5), sprintBurndown[0].status_changed.toString().substring(0, 2)]);

            // Here i count totalTime between remaining time to done
            _.each(issues, function (iss) {
                var issueDate = moment([iss.created_at.toString().substring(6, 10), iss.created_at.toString().substring(3, 5), iss.created_at.toString().substring(0, 2)]);

                daysBetween = startDate.diff(issueDate, 'days');

                if (daysBetween >= 0) {
                    totalTime += parseInt(iss.estimation);
                }
            })

            // Creating labels of data between start and end sprint
            var endDate = moment([sprintBurndown[0].endDate.toString().substring(6, 10), sprintBurndown[0].endDate.toString().substring(3, 5), sprintBurndown[0].endDate.toString().substring(0, 2)]);

            var startDays = endDate.diff(startDate, 'days');

            for (var i = 0; i < startDays + 1; i++) {

                var labelDays = moment(startDate).add({
                    days: i,
                    months: -1
                }).format('DD/MM/YYYY');

                dataLine.labels.push(labelDays);
            }

            // Here I calculate how many days I have from the start to the present day

            var nowDate = CurrDate().substring(0, 10);

            nowDateParsed = moment([nowDate.toString().substring(6, 10), nowDate.toString().substring(3, 5), nowDate.toString().substring(0, 2)]);

            var daysToNow = nowDateParsed.diff(startDate, 'days');

            var sum = totalTime;

            for (var i = 0; i < daysToNow + 1; i++) {
                dataLine.datasets[1].data.push(i);
            }




            dataLine.datasets[1].data[0] = totalTime;

            for (var i = 1; i < daysToNow + 1; i++) {

                _.each(issues, function (iss) {

                    if (iss.added_at.substring(0, 10) == dataLine.labels[i]) {
                        sum += parseInt(iss.estimation);
                    }

                    if (iss.closed_at) {
                        if (iss.closed_at.substring(0, 10) == dataLine.labels[i]) {
                            sum -= parseInt(iss.estimation);
                        }
                    }
                })

                dataLine.datasets[1].data[i] = sum;
            }

            var creatingChartPoints = [];

            for (var i = 0; i < dataLine.datasets[1].data.length; i++) {
                creatingChartPoints[i] = [(i * 24), dataLine.datasets[1].data[i]];
            }

            // and now i must create linear regression

            var linearRegression = ss.linear_regression().data(creatingChartPoints).line();

            for (var i = 0; i < startDays + 1; i++) {
                var value = Math.max(0, linearRegression(i * 24));

                dataLine.datasets[0].data.push(value);
            }

            var ctx = document.getElementById("pBurndown").getContext("2d");

            var myLineChart = new Chart(ctx).Line(dataLine, optionsLine);

            var legendLine = myLineChart.generateLegend();

            $("#legendLine").html(legendLine);

        },
        500)

}
*/