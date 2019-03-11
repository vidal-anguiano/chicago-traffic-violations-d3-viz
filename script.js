
    /**
    * scrollVis - encapsulates
    * all the code for the visualization
    * using reusable charts pattern:
    * http://bost.ocks.org/mike/chart/
    */
    var scrollVis = function () {
    // constants to define the size
    // and margins of the vis area.
        var width = 600;
        var height = 520;
        var margin = { top: 0, left: 20, bottom: 40, right: 10 };

    // Keep track of which visualization
    // we are on and which was the last
    // index activated. When user scrolls
    // quickly, we want to call all the
    // activate functions that they pass.
        var lastIndex = -1;
        var activeIndex = 0;

    // Sizing for the grid visualization
        var squareSize = 6;
        var squarePad = 2;
        var numPerRow = width / (squareSize + squarePad);

    // main svg used for visualization
        var svg = null;

    // d3 selection that will be used
    // for displaying visualizations
        var g = null;

        var xBarScale = d3.scaleBand()
            .paddingInner(.08)
            .range([0, width - 20]);

        var yBarScale = d3.scaleLinear()
            .range([height, 100]);

        var xAxisBar = d3.axisBottom()
            .scale(xBarScale);

        var xScatterScale = d3.scaleLinear()
            .range([0, width - 20]);

        var yScatterScale = d3.scaleLinear()
            .range([height, 100]);

        var xAxisScatter = d3.axisBottom()
            .scale(xScatterScale);

        var yAxisScatter = d3.axisLeft()
            .scale(yScatterScale);

    // When scrolling to a new section
    // the activation function for that
    // section is called.
    var activateFunctions = [];

    // If a section has an update function
    // then it is called while scrolling
    // through the section with the current
    // progress through the section.
    var updateFunctions = [];

    /**
    * chart
    *
    * @param selection - the current d3 selection(s)
    *  to draw the visualization in. For this
    *  example, we will be drawing it in #vis
    */
    var chart = function (selection) {
        selection.each(function (rawData) {
        // create svg and give it a width and height
        svg = d3.select(this).selectAll('svg').data([cumData]);
        var svgE = svg.enter().append('svg');
        // @v4 use merge to combine enter and existing selection
        svg = svg.merge(svgE);

        svg.attr('width', width + margin.left + margin.right);
        svg.attr('height', height + margin.top + margin.bottom);

        svg.append('g');


        // this group element will be used to contain all
        // other elements.
        g = svg.select('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        var cumDebtMax = d3.max(rawData[0], function (d) { return d.cum_debt;});
        var cumMedianMax = d3.max(rawData[1], function (d) { return d.monthly_median_income;});
        var cumPercentMax = d3.max(rawData[1], function (d) { return d.percent_monthly_median_income;});
        yBarScale.domain([0, cumDebtMax]);
        xBarScale.domain(rawData[0].map((s) => s.year));
        xScatterScale.domain([0, cumMedianMax]);
        yScatterScale.domain([0, cumPercentMax]);

        var cumData = rawData[0];
        var monthlyIncome = rawData[1];

        setupVis(cumData, monthlyIncome);

        setupSections();
        });
    };


    /**
    * setupVis - creates initial elements for all
    * sections of the visualization.
    *
    * @param wordData - data object for each word.
    * @param fillerCounts - nested data that includes
    *  element for each filler word type.
    * @param histData - binned histogram data
    */
    var setupVis = function (cumData, monthlyIncome) {

        // axis
        g.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxisBar);
        g.select('.x.axis').style('opacity', 0);

        // Section 1: Title
        var main_title = g.append('text')
            .attr('class', 'main-title')
            .attr('opacity', 0);

        main_title.append('tspan')
            .text('Visualizing Chicago')
            .attr('x', width / 2)
            .attr('y', height / 3);
        main_title.append('tspan')
            .text('Traffic Tickets')
            .attr('x', width / 2)
            .attr('y', height / 2);

        // Section 2: Propublica image
        var imgs = g.append('image')
            .attr("class", "image")
            .attr("xlink:href", "data/propublica.png")
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 400)
            .attr('height', 400)
            .attr("transform", "rotate("+-90+")");;

        // Section 3: Cumulative Debt BarChart
        var bars = g.selectAll('.bars').data(cumData);
        var barsE = bars.enter()
            .append('rect')
            .attr('class','bars');
        bars = bars.merge(barsE)
            .attr('x', (s) => xBarScale(s.year))
            .attr('y', height)
            .attr('fill', '#ddd')
            .attr('width', xBarScale.bandwidth())
            .attr('height',0);

        var barText = g.selectAll('.bar-text').data(cumData);
        barText.enter()
            .append('text')
            .attr('class', 'bar-text')
            .text(function (d) {
                s = d.cum_debt.toString();
                if (d.cum_debt < 100000000) {
                    return '$' + s.substring(0,2) + 'M';}
                else {
                    return '$' + s.substring(0,3) + 'M';
                };
            })
            .attr('x', (s) => xBarScale(s.year))
            .attr('dx', function (d) {
                if (d.cum_debt < 100000000) {
                    return 7;
                }
                else {
                    return 5;
                }
            })
            .attr('y', (s) => yBarScale(s.cum_debt) + 5)
            .attr('dy', 15)
            .style('font-size', '12px')
            .attr('font-family', 'Arial')
            .attr('fill', 'black')
            .attr('opacity', 0);

        var bartitle = g.selectAll('.bartitle').data([0]);
        bartitle.enter()
            .append('text')
            .attr('class','bartitle')
            .text('Cumulative Debt for All Chicagoans')
            .attr('x', 90)
            .attr('dx', 0)
            .attr('y', height)
            .attr('dy', 0)
            .style('font-size', '25px')
            .attr('font-family', 'Arial')
            .attr('opacity', 0)
            .attr('font-weight', 'bold');


        // Section 4: Sand
        var dots = g.selectAll('.dots').data(monthlyIncome);
        var dotsE = dots.enter()
            .append("circle")
            .attr("class", function (d) { return "dot " + d.income_level; })
            .attr("r", .8)
            .attr('opacity', 0)
            .attr("cx", function(d, i) { return randPoint(0, width);});
        // .attr("cx", function(d) { return xScatterScale(d.monthly_median_income);})
        // .attr("cy", function(d) { return yScatterScale(d.percent_monthly_meddian_income);})
    };


    /**
    * setupSections - each section is activated
    * by a separate function. Here we associate
    * these functions to the sections based on
    * the section's index.
    *
    */
    var setupSections = function () {
        // activateFunctions are called each
        // time the active section changes
        activateFunctions[0] = showTitle;
        activateFunctions[1] = showNews;
        activateFunctions[2] = showBars;
        activateFunctions[3] = showSand;
        activateFunctions[4] = siftLowLow;
        activateFunctions[5] = siftLowDebt;
        activateFunctions[6] = siftMediumDebt;
        activateFunctions[7] = siftHighDebt;


        // updateFunctions are called while
        // in a particular section to update
        // the scroll progress in that section.
        // Most sections do not need to be updated
        // for all scrolling and so are set to
        // no-op functions.
        for (var i = 0; i < 9; i++) {
        updateFunctions[i] = function () {};
        }
        updateFunctions[7] = 'functions here';
    };

    /**
    * ACTIVATE FUNCTIONS
    *
    * These will be called their
    * section is scrolled to.
    *
    * General pattern is to ensure
    * all content for the current section
    * is transitioned in, while hiding
    * the content for the previous section
    * as well as the next section (as the
    * user may be scrolling up or down).
    *
    */

    /**
    * showTitle - initial title
    *
    * hides: count title
    * (no previous step to hide)
    * shows: intro title
    *
    */  function showTitle() {
        g.selectAll('.main-title')
            .transition()
            .duration(600)
            .attr('opacity',1);

        g.selectAll('.image')
            .transition()
            .duration(600)
            .attr('x', 0)
            .attr('y', 0)
            .attr('opacity', 0)
            .attr("transform", "rotate("+-90+")");
    };
    /**
     * showTitle - initial title
     *
     * hides: count title
     * (no previous step to hide)
     * shows: intro title
     *
     */
        function showNews() {
        hideAxis();
            g.selectAll('.main-title')
                .transition()
                .duration(0)
                .attr('opacity',0);

        g.selectAll('.count-title')
        .transition()
        .duration(0)
        .attr('opacity', 0);

        g.selectAll('.image')
            .transition()
            .duration(400)
            .attr('x', 0)
            .attr('y', 100)
            .attr('opacity', .3)
            .attr("transform", "rotate("+-15+")");

        g.selectAll('.bars')
            .transition()
            .duration(0)
            .attr('height', 0)
             .attr('y', height)
                .style('opacity', 0);

            g.selectAll('.bar-text')
                .transition()
                .duration(0)
                .style('opacity', 0);

            g.selectAll('.bartitle')
                .transition()
                .duration(0)
                .attr('y', 0)
                .attr('opacity', 0);
        };

    /**
    * showFillerTitle - filler counts
    *
    * hides: intro title
    * hides: square grid
    * shows: filler count title
    *
    */

        function showBars() {
            showAxis(xAxisBar);

            g.selectAll('.image')
                .transition()
                .duration(400)
                .attr('opacity', 0)
                .attr("transform", "rotate("+-90+")");


        g.selectAll('.bars')
            .transition()
            .duration(600)
                .attr('y', (s) => yBarScale(s.cum_debt))
                .attr('height', (s) => height - yBarScale(s.cum_debt))
                .style('opacity', 1);

            g.selectAll('.bar-text')
                .transition()
                .delay(400)
                .duration(600)
                .attr('y', (s) => yBarScale(s.cum_debt))
                .style('opacity', 1);

            g.selectAll('.bartitle')
                .transition()
                .duration(600)
                .attr('y', 60)
                .attr('opacity',1);

            g.selectAll('.dot')
                .transition()
                .duration(200)
                .attr('opacity', 0);


        };

        function showSand() {
            hideAxis();
            g.selectAll('.bars')
                .transition()
                .duration(600)
                .attr('height', 0)
                .attr('y', height)
                .style('opacity', 0);

            g.selectAll('.bar-text')
                .transition()
                .duration(400)
                .attr('y',height-20)
                .style('opacity', 0);

            g.selectAll('.bartitle')
                .transition('title')
                .duration(600)
                .attr('y', -100)
                .attr('opacity', 0);

            console.log('hola guey');

            g.selectAll('.dot')
                .transition()
                .duration(100)
                .delay(function(d, i) { return i * .2; })
                .attr('opacity', 1)
                .attr('r', .5)
                .attr("cx", function(d, i) { return randPoint(0, width);})
                .attr("cy", function(d, i) { return randPoint(0, 50);});
        };

        function siftLowLow () {
            g.selectAll('.dot')
                .filter(function (d) { return (d.percent_monthly_median_income < .25);})
                .transition()
                .duration(100)
                .delay(function(d, i) { return i * .5; })
                .attr('opacity', 1)
                .attr('r', 2)
                .attr("cx", function(d, i) { return randPoint(50, width-50);})
                .attr("cy", function(d, i) { return randPoint(175, 225);});

            g.selectAll('.dot')
                .filter(function (d) { return (d.percent_monthly_median_income >= .25) &
                                              (d.percent_monthly_median_income <= .4);})
                .transition()
                .duration(100)
                .delay(function(d, i) { return i * .5; })
                .attr('opacity', 1)
                .attr('r', .5)
                .attr("cx", function(d, i) { return randPoint(0, width);})
                .attr("cy", function(d, i) { return randPoint(0, 50);});
        };

        function siftLowDebt () {
            g.selectAll('.dot')
                .filter(function (d) { return (d.percent_monthly_median_income >= .25) &
                                              (d.percent_monthly_median_income <= .4);})
                .transition()
                .duration(100)
                .delay(function(d, i) { return i * 1; })
                .attr('opacity', 1)
                .attr('r', 2)
                .attr("cx", function(d, i) { return randPoint(100, width-100);})
                .attr("cy", function(d, i) { return randPoint(250, 300);});

            g.selectAll('.dot')
                .filter(function (d) { return (d.percent_monthly_median_income <= .75) & (d.percent_monthly_median_income > .4);})
                .transition()
                .duration(100)
                .delay(function(d, i) { return i * 1; })
                .attr('opacity', 1)
                .attr('r', .5)
                .attr("cx", function(d, i) { return randPoint(0, width);})
                .attr("cy", function(d, i) { return randPoint(0, 50);});
        };


        function siftMediumDebt () {
            g.selectAll('.dot')
                .filter(function (d) { return (d.percent_monthly_median_income <= .75) &
                                              (d.percent_monthly_median_income > .4);})
                .transition()
                .duration(100)
                .delay(function(d, i) { return i * 3; })
                .attr('opacity', 1)
                .attr('r', 2)
                .attr("cx", function(d, i) { return randPoint(150, width-150);})
                .attr("cy", function(d, i) { return randPoint(325, 375);});

            g.selectAll('.dot')
                .filter(function (d) { return d.percent_monthly_median_income > .75;})
                .transition()
                .duration(100)
                .delay(function(d, i) { return i * 5; })
                .attr('opacity', 1)
                .attr('r', .5)
                .attr("cx", function(d, i) { return randPoint(0, width);})
                .attr("cy", function(d, i) { return randPoint(0, 50);});

        };


        function siftHighDebt () {
            g.selectAll('.dot')
                .filter(function (d) { return d.percent_monthly_median_income > .75;})
                .transition()
                .duration(100)
                .delay(function(d, i) { return i * 5; })
                .attr('opacity', 1)
                .attr('r', 2)
                .attr("cx", function(d, i) { return randPoint(200, width-200);})
                .attr("cy", function(d, i) { return randPoint(400, 450);});

        };


    /**
    * showAxis - helper function to
    * display particular xAxis
    *
    * @param axis - the axis to show
    *  (xAxisHist or xAxisBar)
    */
    function showAxis(axis) {
        g.select('.x.axis')
        .call(axis)
        .transition().duration(500)
        .style('opacity', 1);
    }

    /**
    * hideAxis - helper function
    * to hide the axis
    *
    */
    function hideAxis() {
        g.select('.x.axis')
        .transition().duration(500)
        .style('opacity', 0);
    };

    /**
    * activate -
    *
    * @param index - index of the activated section
    */
    chart.activate = function (index) {
        activeIndex = index;
        var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
        var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
        scrolledSections.forEach(function (i) {
        activateFunctions[i]();
        });
        lastIndex = activeIndex;
    };

    /**
    * update
    *
    * @param index
    * @param progress
    */
    chart.update = function (index, progress) {
        updateFunctions[index](progress);
    };

    // return chart function
    return chart;
    };


    /**
    * display - called once data
    * has been loaded.
    * sets up the scroller and
    * displays the visualization.
    *
    * @param data - loaded tsv data
    */
    function display(data) {
    // create a new plot and
    // display it
    var plot = scrollVis();
    d3.select('#vis')
        .datum(data)
        .call(plot);

    // setup scroll functionality
    var scroll = scroller()
        .container(d3.select('#graphic'));

    // pass in .step selection as the steps
    scroll(d3.selectAll('.step'));

    // setup event handling
    scroll.on('active', function (index) {
        // highlight current step text
        d3.selectAll('.step')
        .style('opacity', function (d, i) { return i === index ? 1 : 0.1; });

        // activate current section
        plot.activate(index);
    });

    scroll.on('progress', function (index, progress) {
        plot.update(index, progress);
    });
    };

var randPoint = function(min, max) {
    return Math.floor(Math.random() * (max-min)) + min;
};

    // load data and display
    // d3.tsv('./data/words.tsv').then(display);


var files = ['data/cum_debt.json', 'data/agg_data.json'];
    var promises = [];

    files.forEach(function(url, i) {
            promises.push(d3.json(url));}
    );

    Promise.all(promises)
        .then(function (promises) {
            console.log(promises[0]);
            console.log(promises[1]);
            display(promises);
        });
