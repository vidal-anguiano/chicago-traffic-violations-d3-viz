
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
        var rollingDebt = rawData[2];
        var finesByGroup = rawData[3];
        

         setupVis(cumData, monthlyIncome, rollingDebt, finesByGroup);

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
    var setupVis = function (cumData, monthlyIncome, rollingDebt, finesByGroup) {

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
            .attr('x', 300)
            .attr('y', 500)
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

        // Section 3.5: Stacked Bars
        var stack = d3.stack()
            .keys(["low-income", "middle-income", "high-income"])
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);

        var dataset = stack(rollingDebt);
        console.log(dataset);

        var colors = ["#173F5F", "#F6D55C", "#ED553B"];
        var groups = ['Low-Income', 'Middle-Income', 'High-Income'];

        var stackedLegend = svg.selectAll("stacklegend")
            .data(dataset)
            .enter().append("rect")
            .attr("class", "stack-legend")
            .attr('x', 50)
            .attr('y', function(d, i) { return i*-30 + 200; })
            .attr('height', 20)
            .attr('width', 20)
            .style("fill", function(d, i) { return colors[i]; })
            .attr('opacity', 0);

        var stackedLegendText = svg.selectAll("stacklegendtext")
            .data(dataset)
            .enter().append('text')
            .attr('class','stack-legend')
            .text(function(d, i) { return groups[i]; })
            .attr('x', 75)
            .attr('dx', 0)
            .attr('y', function(d, i) { return i*-30 + 200; })
            .attr('dy', 15)
            .attr('opacity', 0);


        var groupsd = svg.selectAll("g.cost")
            .data(dataset)
            .enter().append("g")
            .attr("class", "cost")
            .style("fill", function(d, i) { return colors[i]; });

        var rect = groupsd.selectAll("rect")
            .data(function(d) { return d; })
            .enter()
            .append("rect")
            .attr('class','rect')
            .attr("x", function(d) { return xBarScale(d.data.year) + 20; });

        // Section 4: People

        var pop_bubbles = g.selectAll('popBubbles')
            .data(finesByGroup)
            .enter()
            .append('circle')
            .attr('class', function(d, i) { return 'pop-bubbles ' + d.income_level; })
            .attr("r", 0)
            .attr('cx', width/3)
            .attr('cy', function(d, i) { return (i+1)*(25*(i+1)+70); });

        var pop_bubbles_text = g.selectAll('popBubbles')
            .data(finesByGroup)
            .enter()
            .append('text')
            .attr('class', function(d, i) { return 'pop-bubbles-text ' + d.income_level; })
            .text(function(d, i) { return ('' + d.num_people).slice(0,-3) + "K Drivers"; })
            .attr('x', function(d, i) { return width/3 + (i+1)*(8*(i+1))+22; })
            .attr('y', function(d, i) { return (i+1)*(25*(i+1)+70); })
            .attr('dx', 0)
            .attr('dy', 5)
            .style('fill', 'black')
            .style('font-weight', 'bold')
            .attr('opacity', 0);

        // Section 4: Sand
        var dots = g.selectAll('.dots').data(monthlyIncome);
        var dotsE = dots.enter()
            .append("circle")
            .attr("class", function (d) { return "dot " + d.income_level; })
            .attr("r", 3)
            .attr('opacity', 0)
            .attr('cx', width/3)
            .attr('cy', function(d, i) {

                income_level_group = {'high-income': 0,
                                      'middle-income': 1,
                                      'low-income': 2};

                i_ = income_level_group[d.income_level];

                return (i_+1)*(25*(i_+1)+70); })
            .on("mouseover", function() { tooltip.style("display", null); })
            .on("mouseout", function() { tooltip.style("display", "none");
                                         d3.select(this).attr('r',2); })
            .on("mousemove", function(d) {
                var xPosition = d3.mouse(this)[0] - 15;
                var yPosition = d3.mouse(this)[1] - 70;
                tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
                tooltip.select("#line1").text('Total Fines ------------- $' + numberWithCommas(Math.round(d.fines)));
                tooltip.select("#line2").text('Monthly Income ------- $' + numberWithCommas(d.monthly_median_income));
                tooltip.select("#line3").text('% of Monthly Income -- ' + round(d.percent_monthly_median_income*100, 1) + '%');
                d3.select(this).attr('r',4);
            });

        var tooltip = svg.append("g")
            .attr("class", "tooltip")
            .style("display", "none");

        tooltip.append("rect")
            .attr("width", 240)
            .attr("height", 50)
            .attr("fill", "white")
            .style("opacity", .8);

        tooltip.append("text")
            .attr('class', 'tooltip')
            .attr("id", 'line1')
            .attr("x", 15)
            .attr("dy", 15)
            .attr("dx", -10);

        tooltip.append("text")
            .attr('class', 'tooltip')
            .attr('id', 'line2')
            .attr("x", 15)
            .attr("dy", 30)
            .attr("dx", -10);

        tooltip.append("text")
            .attr('class', 'tooltip')
            .attr('id', 'line3')
            .attr("x", 15)
            .attr("dy", 45)
            .attr("dx", -10);


        var dotlabels = g.selectAll('dot-labels').data([{label:'<25%', class_label: 'first'},
                                                        {label:'25-40%', class_label: 'second'},
                                                        {label:'40-75%', class_label: 'third'},
                                                        {label:'>75%', class_label: 'fourth'}])
            .enter()
            .append('text')
            .attr('class', function(d) { return 'dot-labels ' + d.class_label; })
            .text(function (d, i) { return d.label; })
            .attr('x', 0)
            .attr('y', -100)
            .attr('dx', 0)
            .attr('dy', 0)
            .attr('opacity', 0);
        // .attr("cx", function(d) { return xScatterScale(d.monthly_median_income);})
        // .attr("cy", function(d) { return yScatterScale(d.percent_monthly_meddian_income);})

        // console.log(monthlyIncome);
        // var simulation = d3.forceSimulation(monthlyIncome)
        //     .force('charge', d3.forceManyBody().strength(5))
        //     .force('center', d3.forceCenter(width / 2, height / 2))
        //     .force('collision', d3.forceCollide().radius(2))
        //     .on('tick', siftHighDebt);

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
        activateFunctions[3] = showBars;
        activateFunctions[4] = popBubble;
        activateFunctions[5] = popBubble;
        activateFunctions[6] = popBubble;
        activateFunctions[7] = showSand;
        activateFunctions[8] = siftLowLow;
        activateFunctions[9] = siftLowDebt;
        activateFunctions[10] = siftMediumDebt;
        activateFunctions[11] = siftHighDebt;


        // updateFunctions are called while
        // in a particular section to update
        // the scroll progress in that section.
        // Most sections do not need to be updated
        // for all scrolling and so are set to
        // no-op functions.
        for (var i = 0; i < 9; i++) {
        updateFunctions[i] = function () {};
        }
        updateFunctions[3] = updateIncomeBars;
        updateFunctions[4] =  showHighIncomeGroup;
        updateFunctions[5] =  showMiddleIncomeGroup;
        updateFunctions[6] =  showLowIncomeGroup;
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
            .attr('x', 300)
            .attr('y', 500)
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
                .attr('x', 300)
                .attr('y', 500)
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

            g.select('.dots-title.one')
                .classed('highlighted-dots-title', false)
                .transition()
                .duration(400)
                .attr('opacity', 0);

            g.selectAll('.dot')
                .transition()
                .duration(200)
                .attr('opacity', 0);

            svg.selectAll('.rect')
                .attr('opacity', 0);

            svg.selectAll('.stack-legend')
                .attr('opacity', 0);

            g.selectAll('.pop-bubbles')
                .attr('r', 0)
                .attr("opacity", 0);

            g.selectAll('.pop-bubbles-text')
                .attr('r', 0)
                .attr("opacity", 0);




        };

        function popBubble() {
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

            svg.selectAll('.rect')
                .attr('opacity', 0);

            svg.selectAll('.stack-legend')
                .transition()
                .duration(400)
                .attr('opacity', 0);

            g.select('.dots-title.one')
                .classed('highlighted-dots-title', false)
                .transition()
                .duration(400)
                .attr('opacity', 0);

            g.selectAll('.dot')
                .attr('opacity', 0)
                .transition()
                .duration(200)
                .attr('r', 3)
                .attr('cx', width/3)
                .attr('cy', function(d, i) {

                    income_level_group = {'high-income': 0,
                                          'middle-income': 1,
                                          'low-income': 2};

                    i_ = income_level_group[d.income_level];

                    return (i_+1)*(25*(i_+1)+70); });;
        };

        function showSand() {

            g.selectAll('.pop-bubbles')
                .transition()
                .duration(2500)
                .attr('r', 0)
                .attr("opacity", 0);

            g.selectAll('.pop-bubbles-text')
                .attr('opacity', 0);

            g.selectAll('.dot')
                .transition()
                .duration(400)
                .delay(function(d, i) { return i * .2; })
                .attr('opacity', 1)
                .attr('r', .5)
                .attr("cx", function(d, i) { return randPoint(0, width);})
                .attr("cy", function(d, i) { return randPoint(0, 50);});

            g.selectAll('.dot-labels.first')
                .classed('dot-labels-active', false)
                .attr('opacity', 0);

            // g.selectAll('.dot.middle-income')
            //     .transition()
            //     .duration(400)
            //     .delay(1000)
            //     .delay(function(d, i) { return i * .2; })
            //     .attr('opacity', 1)
            //     .attr('r', .5)
            //     .attr("cx", function(d, i) { return randPoint(0, width);})
            //     .attr("cy", function(d, i) { return randPoint(0, 50);});

            // g.selectAll('.dot.low-income')
            //     .transition()
            //     .duration(400)
            //     .delay(1600)
            //     .delay(function(d, i) { return i * .2; })
            //     .attr('opacity', 1)
            //     .attr('r', .5)
            //     .attr("cx", function(d, i) { return randPoint(0, width);})
            //     .attr("cy", function(d, i) { return randPoint(0, 50);});
        };

        function siftLowLow () {

            g.selectAll('.dot')
                .filter(function (d) { return (d.percent_monthly_median_income < .25);})
                .transition()
                .duration(100)
                .delay(function(d, i) { return i * .5; })
                .attr('opacity', function(d) { return 1*(d.percent_monthly_median_income/.25 + .20); })
                .attr('r', 2)
                .attr("cx", function(d, i) { return d.cx;})
                .attr("cy", function(d, i) { return d.cy;});

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

            g.selectAll('.dot-labels.first')
                .classed('dot-labels-active', true)
                .attr('x', 0)
                .attr('y', 170)
                .attr('dx', 0)
                .attr('dy', 0)
                .attr('opacity', 1);

            g.selectAll('.dot-labels.second')
                .classed('dot-labels-active', false)
                .attr('opacity', 0);

        };

        function siftLowDebt () {

            g.selectAll('.dot')
                .filter(function (d) { return (d.percent_monthly_median_income >= .25) &
                                              (d.percent_monthly_median_income <= .4);})
                .transition()
                .duration(100)
                .delay(function(d, i) { return i * 1; })
                .attr('opacity', function(d) { return 1*((d.percent_monthly_median_income-.25)/.15 + .20); })
                .attr('r', 2)
                .attr("cx", function(d, i) { return d.cx;})
                .attr("cy", function(d, i) { return d.cy;});

            g.selectAll('.dot')
                .filter(function (d) { return (d.percent_monthly_median_income <= .75) & (d.percent_monthly_median_income > .4);})
                .transition()
                .duration(100)
                .delay(function(d, i) { return i * 1; })
                .attr('opacity', 1)
                .attr('r', .5)
                .attr("cx", function(d, i) { return randPoint(0, width);})
                .attr("cy", function(d, i) { return randPoint(0, 50);});

            g.selectAll('.dot-labels.second')
                .classed('dot-labels-active', true)
                .attr('x', 0)
                .attr('y', 310)
                .attr('dx', 0)
                .attr('dy', 0)
                .attr('opacity', 1);

            g.selectAll('.dot-labels.third')
                .classed('dot-labels-active', false)
                .attr('opacity', 0);
        };


        function siftMediumDebt () {

            g.selectAll('.dot')
                .filter(function (d) { return (d.percent_monthly_median_income <= .75) &
                                              (d.percent_monthly_median_income > .4);})
                .transition()
                .duration(100)
                .delay(function(d, i) { return i * 3; })
                .attr('opacity', function(d) { return 1*((d.percent_monthly_median_income-.40)/.35 + .20); })
                .attr('r', 2)
                .attr("cx", function(d, i) { return d.cx;})
                .attr("cy", function(d, i) { return d.cy;});

            g.selectAll('.dot')
                .filter(function (d) { return d.percent_monthly_median_income > .75;})
                .transition()
                .duration(100)
                .delay(function(d, i) { return i * 5; })
                .attr('opacity', 1)
                .attr('r', .5)
                .attr("cx", function(d, i) { return randPoint(0, width);})
                .attr("cy", function(d, i) { return randPoint(0, 50);});


            g.selectAll('.dot-labels.third')
                .classed('dot-labels-active', true)
                .attr('x', 0)
                .attr('y', 349)
                .attr('dx', 0)
                .attr('dy', 0)
                .attr('opacity', 1);

            g.selectAll('.dot-labels.fourth')
                .classed('dot-labels-active', false)
                .attr('opacity', 0);


        };


        function siftHighDebt () {

            g.selectAll('.dot')
                .filter(function (d) { return d.percent_monthly_median_income > .75;})
                .transition()
                .duration(100)
                .delay(function(d, i) { return i * 2; })
                .attr('opacity', function(d) { return 1*((d.percent_monthly_median_income-.75)/.15 + .20); })                           .attr('r', 2)
                .attr("cx", function(d, i) { return d.cx;})
                .attr("cy", function(d, i) { return d.cy;});

            g.selectAll('.dot-labels.fourth')
                .classed('dot-labels-active', true)
                .attr('x', 0)
                .attr('y', 380)
                .attr('dx', 0)
                .attr('dy', 0)
                .attr('opacity', 1);


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
    * UPDATE FUNCTIONS
    *
    * These will be called within a section
    * as the user scrolls through it.
    *
    * We use an immediate transition to
    * update visual elements based on
    * how far the user has scrolled
    *
    */

    /**
    * updateCough - increase/decrease
    * cough text and color
    *
    * @param progress - 0.0 - 1.0 -
    *  how far user has scrolled in section
    */
    function updateIncomeBars(progress) {
        svg.selectAll('.stack-legend')
            .attr('opacity', 1);

        svg.selectAll('.rect')
            .attr("y", function(d) { return yBarScale(d[1]); })
            .attr("height", function(d) { return yBarScale(d[0]) - yBarScale(d[1]); })
            .attr("width", xBarScale.bandwidth())
            .transition()
            .duration(0)
            .attr('opacity', progress*1.5);

        g.selectAll('.pop-bubbles.high-income')
            .transition()
            .duration(50)
            .attr("opacity", 0);

        g.selectAll('.pop-bubbles-text.high-income')
            .transition()
            .duration(50)
            .attr('opacity', 0);
    };

    function showHighIncomeGroup(progress) {
        g.selectAll('.pop-bubbles.high-income')
            .transition()
            .duration(0)
            .attr("r", function(d, i) { return (100*Math.sqrt(d.percent_of_people))*progress; })
            .attr("opacity", 1);

        g.selectAll('.pop-bubbles-text.high-income')
            .attr('opacity', 1);


        g.selectAll('.pop-bubbles.middle-income')
            .transition()
            .duration(50)
            .attr("opacity", 0);

        g.selectAll('.pop-bubbles-text.middle-income')
            .transition()
            .duration(50)
            .attr('opacity', 0);

    };

    function showMiddleIncomeGroup(progress) {
        g.selectAll('.pop-bubbles.middle-income')
            .transition()
            .duration(0)
            .attr("r", function(d, i) { return (100*Math.sqrt(d.percent_of_people))*progress; })
            .attr("opacity", 1);

        g.selectAll('.pop-bubbles-text.middle-income')
            .attr('opacity', 1);

        g.selectAll('.pop-bubbles.low-income')
            .transition()
            .duration(50)
            .attr("opacity", 0);

        g.selectAll('.pop-bubbles-text.low-income')
            .transition()
            .duration(50)
            .attr('opacity', 0);
    };

    function showLowIncomeGroup(progress) {
        g.selectAll('.pop-bubbles.low-income')
            .transition()
            .duration(0)
            .attr("r", function(d, i) { return (100*Math.sqrt(d.percent_of_people))*progress; })
            .attr("opacity", 1);

        g.selectAll('.pop-bubbles-text.low-income')
            .attr('opacity', 1);

        g.selectAll('.pop-bubbles.middle-income')
            .transition()
            .duration(0)
            .attr("r", function(d, i) { return (100*Math.sqrt(d.percent_of_people)); })
            .attr("opacity", 1);

        g.selectAll('.pop-bubbles-text.middle-income')
            .attr('opacity', 1);

        g.selectAll('.pop-bubbles.high-income')
            .transition()
            .duration(0)
            .attr("r", function(d, i) { return (100*Math.sqrt(d.percent_of_people)); })
            .attr("opacity", 1);

        g.selectAll('.pop-bubbles-text.high-income')
            .attr('opacity', 1);



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


var files = ['data/cum_debt.json', 'data/agg_data2.json', 'data/year_income_rolling.json', 'data/average_fines_by_group.json'];
    var promises = [];

    files.forEach(function(url, i) {
            promises.push(d3.json(url));}
    );

    Promise.all(promises)
        .then(function (promises) {
            console.log(promises[0]);
            console.log(promises[1]);
            console.log(promises[2]);
            console.log(promises[3]);
            display(promises);
        });

var monthlyIncome2 = promises[1];
 
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}
