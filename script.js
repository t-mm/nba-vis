function typeData(d) {
  d.Age = +d.Age;
  d.G = +d.G;
  d.GS = +d.GS;
  d.MP = +d.MP;
  d.FG = +d.FG;
  d.FGA = +d.FGA;
  d["FG%"] = +d["FG%"];
  d["3P"] = +d["3P"];
  d["3PA"] = +d["3PA"];
  d["3P%"] = +d["3P%"];
  d["2P"] = +d["2P"];
  d["2PA"] = +d["2PA"];
  d["2P%"] = +d["2P%"];
  d["eFG%"] = +d["eFG%"];
  d.FT = +d.FT;
  d.FTA = +d.FTA;
  d["FT%"] = +d["FT%"];
  d.ORB = +d.ORB;
  d.DRB = +d.DRB;
  d.TRB = +d.TRB;
  d.AST = +d.AST;
  d.STL = +d.STL;
  d.BLK = +d.BLK;
  d.TOV = +d.TOV;
  d.PF = +d.PF;
  d.PTS = +d.PTS;
  return d;
}

let svgWidth = 800, svgHeight = 600;
let margin = { top: 20, right: 20, bottom: 50, left: 70 };
let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;
// Create scales based on filtered data
let xScale = null;
let yScale = null
let radiusScale = null
let opacityScale = null
let colorScale = d3.scaleOrdinal(d3.schemeCategory10);

let svg;
let chartGroup;
let tooltip;


// Function to draw scatter plot based on filtered data
function updateScatterPlot(filtered_data) {

  // clear out old chart
  chartGroup.selectAll("*").remove();

  // Create axes based on scales
  let xAxis = d3.axisBottom(xScale);
  let yAxis = d3.axisLeft(yScale);

  // Append axes
  chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("x", width)
    .attr("y", -6)
    .style("text-anchor", "end")
    .text("Assists Per Game")
    .style("fill", "black")
    .style("font-size", "15px");

  chartGroup.append("g")
    .call(yAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Points Per Game")
    .style("fill", "black")
    .style("font-size", "15px");;

  // Append circles for data points
  chartGroup.selectAll("circle")
    .data(filtered_data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.AST))
    .attr("cy", d => yScale(d.PTS))
    // .attr("r", 5)
    .attr("r", d => radiusScale(d.TRB))  // now the radius is adjusted based on blocks per game
    // .style("fill", "steelblue")
    .style("fill", d => colorScale(d.Pos)) // Color is set based on the player's position
    .style("opacity", d => opacityScale(d['eFG%']));

  // Add tooltip to each circle
  chartGroup.selectAll("circle")
    .on('mouseover', function (event, d) { // d is the datum of the circle, event is the actual event
      console.log("hi")
      tooltip.style('display', 'inline-block')
        .html(`Player: ${d.Player}<br/> 
                  Team: ${d.Tm}<br/>
                  Position: ${d.Pos}<br/>
                  Assists Per Game: ${d.AST}<br/>
                  Points Per Game: ${d.PTS}<br/>
                  Effective Field Goal Percentage: ${d['eFG%']}<br/>
                  `)
        .style('left', `${event.pageX}px`)
        .style('top', `${event.pageY}px`);
    })
    .on('mouseout', function () {
      tooltip.style('display', 'none');
    });
}

d3.csv("2022-2023 NBA Player Stats - Regular.csv").then(function (data) {
  data = data.map(typeData);
  console.log(data);

  svg = d3.select("#graph")
  .append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight);
chartGroup = svg.append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);


tooltip = d3.select('#options')
  .append('div')
  .attr('class', 'tooltip')
  .style('display', 'none');

  // Define min and max age in the dataset
  let minAge = d3.min(data, d => d.Age);
  let maxAge = d3.max(data, d => d.Age);
  let teams = ['All'], positions = ['All'];
  data.forEach(function (d) {
    if (teams.indexOf(d.Tm) === -1) teams.push(d.Tm);
    if (positions.indexOf(d.Pos) === -1) positions.push(d.Pos);
  });
  console.log(teams);
  console.log(positions);

  xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => parseFloat(d.AST)))
    .range([0, width]);

  yScale = d3.scaleLinear()
    .domain(d3.extent(data, d => parseFloat(d.PTS)))
    .range([height, 0]); // reverse y-axis

  // Create a linear scale for the circle radius (blocks per game)
  radiusScale = d3.scaleLinear()
    .domain(d3.extent(data, d => parseFloat(d.TRB)))
    .range([3, 8]);  // range of radius sizes, adjust to suit your visualization

  opacityScale = d3.scaleLinear()
    .domain(d3.extent(data, d => parseFloat(d['eFG%'])))
    .range([0.1, 1]);

  let teamDropdown = d3.select("#teamDropdown").on("change", updateVisualization);
  let posDropdown = d3.select("#posDropdown").on("change", updateVisualization);
  teamDropdown.selectAll("option")
    .data(teams)
    .enter().append("option")
    .text(function (d) { return d; });
  posDropdown.selectAll("option")
    .data(positions)
    .enter().append("option")
    .text(function (d) { return d; });

  var ageSlider = new rSlider({
    target: '#ageSlider',
    values: { min: minAge, max: maxAge },
    step: 1,
    range: true,
    set: [minAge, maxAge],
    tooltip: true,
    scale: false,
    labels: false,
    width: 250,
    onChange: function (values) {
      var ageValues = values.split(',');
      minAge = ageValues[0];
      maxAge = ageValues[1];
      updateVisualization();
    }
  });

  // Initialize data
  updateScatterPlot(data);

  // Function to filter data and update visualization
  function updateVisualization() {
    // Get current selections
    let selectedTeam = teamDropdown.node().value;
    let selectedPosition = posDropdown.node().value;

    // Filter data based on selections
    let filtered_data = data.filter(function (d) {
      // console.log(d.Age, minAge, maxAge)
      return (
        (d.Tm === selectedTeam || selectedTeam === 'All') &&
        (d.Pos === selectedPosition || selectedPosition === 'All') &&
        (parseFloat(d.Age) >= parseFloat(minAge) && parseFloat(d.Age) <= parseFloat(maxAge))
      );
    })
    console.log(filtered_data);
    updateScatterPlot(filtered_data);
  }


});


  // // Create a div to hold the slider
  // let sliderDiv = d3.select("#ageSlider")
  //   .style("width", "400px")
  //   .style("margin", "60px auto");

  // let ageSlider = document.getElementById('ageSlider');

  // noUiSlider.create(ageSlider, {
  //   start: [minAge, maxAge],
  //   connect: true,
  //   step: 1,
  //   range: {
  //     'min': minAge,
  //     'max': maxAge
  //   },
  //   tooltips: [
  //     {
  //       to: function (value) {
  //         return Math.round(value);
  //       },
  //       from: function (value) {
  //         return Math.round(parseFloat(value));
  //       }
  //     },
  //     {
  //       to: function (value) {
  //         return Math.round(value);
  //       },
  //       from: function (value) {
  //         return Math.round(parseFloat(value));
  //       }
  //     }
  //   ],
  //   // pips: { // Show pips on the slider
  //   //   mode: 'steps',
  //   //   density: 5,   // Density of the pips, can adjust as needed
  //   // }
  // });

  // ageSlider.noUiSlider.on('update', function (values, handle) {
  //   // update the visualization based on slider changes
  //   console.log(values)
  //   minAge = values[0];
  //   maxAge = values[1];
  //   updateVisualization(); // Assuming updateVisualization can accept these parameters
  // });