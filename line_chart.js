const dataset_two = [
    { date: new Date("2022-01-01"), value: 200, location: 322, rainfall: 100 },
    { date: new Date("2022-02-01"), value: 250, location: 656, rainfall: 200 },
    { date: new Date("2022-03-01"), value: 180, location: 123, rainfall: 250 },
    { date: new Date("2022-04-01"), value: 300, location: 545, rainfall: 150 },
    { date: new Date("2022-05-01"), value: 280, location: 123, rainfall: 200 },
    { date: new Date("2022-06-01"), value: 220, location: 453, rainfall: 300 },
    { date: new Date("2022-07-01"), value: 100, location: 250, rainfall: 290 },
    { date: new Date("2022-08-01"), value: 450, location: 300, rainfall: 321 },
    { date: new Date("2022-09-01"), value: 200, location: 800, rainfall: 232 },
    { date: new Date("2022-10-01"), value: 500, location: 600, rainfall: 454 },
    { date: new Date("2022-11-01"), value: 600, location: 234, rainfall: 232 },
    { date: new Date("2022-12-01"), value: 200, location: 500, rainfall: 678 }
];


const margin = { top: 70, right: 30, bottom: 40, left: 80 }
const width = 1200 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;


const svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Add background color
svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "#f0f0f0"); // Set the background color

// create tooltip div
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

// x Axis 
const xAxis = d3.scaleTime()
    .range([0, width])
    .domain(d3.extent(dataset_two, d => d.date));

svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xAxis)
        .ticks(d3.timeMonth.every(1))
        .tickFormat(d3.timeFormat("%b %Y")))
    .call(g => g.select(".domain").remove());
svg.selectAll(".tick text")
    .attr("fill", "#777");

// top axis
const xTop = d3.scaleTime()
    .range([0, width])
    .domain(d3.extent(dataset_two, d => d.date));

svg.append("g")
    .call(d3.axisTop(xTop)
        .ticks(d3.timeMonth.every(1))
        .tickFormat(d3.timeFormat("%d %B %Y")));

// left axis       
const yLeft = d3.scaleLinear()
    .range([height, 0])
    .domain([0, d3.max(dataset_two, d => d.value)]);

svg.append("g")
    .call(d3.axisLeft(yLeft))

const line = d3.line()
    .x(d => xAxis(d.date))
    .y(d => yLeft(d.value));

svg.append("path")
    .datum(dataset_two)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", line);

// right axis
const yRight = d3.scaleLinear()
    .range([height, 0])
    .domain([0, d3.max(dataset_two, d => d.location)]);

svg.append("g")
    .attr("transform", `translate(${width}, 0)`)
    .call(d3.axisRight(yRight));

const line_right = d3.line()
    .x(d => xAxis(d.date))
    .y(d => yRight(d.location));

svg.append("path")
    .datum(dataset_two)
    .attr("fill", "none")
    .attr("stroke", "red")
    .style("stroke-dasharray", ("3, 3"))
    .attr("stroke-width", 1.5)
    .attr("d", line_right);




// Add a circle element for the first line
const circleLeft = svg.append("circle")
    .attr("r", 0)
    .attr("fill", "steelblue")
    .style("stroke", "white")
    .attr("opacity", .70)
    .style("pointer-events", "none");

// Add a circle element for the second line
const circleRight = svg.append("circle")
    .attr("r", 0)
    .attr("fill", "red")
    .style("stroke", "white")
    .attr("opacity", .70)
    .style("pointer-events", "none");


// create a listening rectangle
const listeningRect = svg.append("rect")
    .attr("width", width)
    .attr("height", height);

// create the mouse move function
listeningRect.on("mousemove", function (event) {
    const [xCoord] = d3.pointer(event, this);
    const bisectDate = d3.bisector(d => d.date).left;
    const x0 = xAxis.invert(xCoord);
    const i = bisectDate(dataset_two, x0, 1);
    const d0 = dataset_two[i - 1];
    const d1 = dataset_two[i];
    const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    const xPos = xAxis(d.date);
    const yPosRight = yRight(d.location);
    const yPosLeft = yLeft(d.value);


    // Update the position for the circle on the left
    circleLeft.attr("cx", xPos)
        .attr("cy", yPosLeft);

    // Update the position for the circle on the right
    circleRight.attr("cx", xPos)
        .attr("cy", yPosRight);

    // Add transition for the circle radii
    circleLeft.transition()
        .duration(50)
        .attr("r", 5);

    circleRight.transition()
        .duration(50)
        .attr("r", 5);

    // add in  our tooltip
    tooltip
        .style("display", "block")
        .style("left", `${xPos + 100}px`)
        .style("top", `${yPosRight + 50}px`)
        .html(`<strong>Date:</strong> ${d.date.toLocaleDateString()}<br><strong>Value:</strong> ${d.value !== undefined ? d.value + 'k' : 'N/A'}`)
});

// listening rectangle mouse leave function
listeningRect.on("mouseleave", function () {
    circleLeft.transition()
      .duration(50)
      .attr("r", 0);

    tooltip.style("display", "none");
  });


// Add vertical gridlines
svg.selectAll("xGrid")
    .data(xAxis.ticks().slice(0))
    .join("line")
    .attr("x1", d => xAxis(d))
    .attr("x2", d => xAxis(d))
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", .5);


// Add Y-axis label
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("fill", "#777")
    .style("font-family", "sans-serif")
    .text("Total Population");


// Add the chart title
svg.append("text")
    .attr("class", "chart-title")
    .attr("x", margin.left - 115)
    .attr("y", margin.top - 100)
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .text("Prison Populations in the US Have Trended Upward Since Summer 2020");

// Add the source credit
svg.append("text")
    .attr("class", "source-credit")
    .attr("x", width - 1125)
    .attr("y", height + margin.bottom - 3)
    .style("font-size", "9px")
    .style("font-family", "sans-serif")
    .text("Source: rimes.int");