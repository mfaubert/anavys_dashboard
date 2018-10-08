
// The line that starts with .defer are for readubg the projects data json file, you can add as many defer as you want,
// the data will be read in parallel, and wait for all the data to be read before executing the makeGraphs function
// Inside the .await function we call a function named makeGraphs that we define later.

//The makeGraphs function contains the code for cleaning the data, building the crossfilter dimensions for filtering
// the data and the dc.js charts. It takes 3 arguments, the 1st one is error which can be used for handling any error
// from the .defer functions and a second and third arguments projectsJson, statesJson which contains the data that we
// read from the .defer functions.


import {crossfilter} from "./lib/js/crossfilter";

queue()
    .defer(d3.json, "/Applications/MAMP/htdocs/anavys/simpleDashboard/data")
    .await(makeGraphs);

function makeGraphs(error, projectJson, statesJson) {
    // We start by cleaning the projects data.
    // We change date type from string to datetime objects
    // We set all projects date days to 1
    // All project from the same month will have the same datetime value.

    var donorschooseProjects = projectJson;
    var dateFormat = d3.time.format("%Y-%m-%d");
    donorschooseProjects.forEach(function(d) {
        d["date_posted"] = dateFormat.parse(d["date_posted"]);
        d["date_posted"].setDate(1);
        d["total_donations"] = +d["total_donations"];
    });

    // We create a crossfilter instance
    var ndx = crossfilter(donorschooseProjects)

    // We define our 5 data dimensions
    var dateDim = ndx.dimension(function(d) { return d["date_posted"]; });
    var resourceTypeDim = ndx.dimension(function(d) { return d["resource_type"]; });
    var povertyLevelDim = ndx.dimension(function(d) { return d["poverty_level"]; });
    var stateDim = ndx.dimension(function (d) { return d["school_state"]; });
    var totalDonationsDim = ndx.dimension(function (d) { return d["total_donations"]; });

    //We define 6 data groups

    var all = ndx.groupAll();
    var numProjectsByDate = dateDim.group();
    var numProjectsByResourceType = resourceTypeDim.group();
    var numProjectsByProvertyLevel = povertyLevelDim.group();
    var totalDonationsByState = stateDim.group().reduceSum(function (d) {
        return d["total_donations"];
    });
    var totalDonations = ndx.groupAll.reduceSum(function(d) {return d["total_donations"];});

    // We define 3 values; The maximum donation in all statues the date of the first and last posts
    var max_state = totalDonationsByState.top(1)[0].value;
    var minDate = dateDim.bottom(1)[0]["date_posted"];
    var maxDate = dateDim.top(1)[0]["date_posted"];

    // We define 6 dc charts
    var timeChart = dc.barChart("#time-chart");
    var resourceTypeChart = dc.rowChart("#resource-type-row-chart");
    var povertyLevelChart = dc.rowChart("#poverty-level-row-chart");
    var usChart = dc.geoChoroplethChart("#us-chart");
    var numberProjectsND = dc.numberDisplay("#number-projects-nd");
    var totalDonationsND = dc.numberDisplay("#total-donations-nd");


};

