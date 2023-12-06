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
let colorScale = d3.scaleOrdinal().range(["#000000", "#E69F00", "#56B4E9", "#009E73", "#F0E442", "#0072B2", "#D55E00", "#CC79A7"]);

let svg;
let chartGroup;
let tooltip;

let selectedPlayers = [];
function displayPlayerStats() {
  let statsDiv = d3.select('#playerStats');
  statsDiv.html(""); // Clear existing content

  selectedPlayers.forEach(player => {
      let playerDiv = statsDiv.append('div');
      playerDiv.html(`<h3>${player.Player}</h3>
                      <p>Team: ${player.Tm}</p>
                      <p>Age: ${player.Age}</p>
                      <p>Position: ${player.Pos}</p>
                      <p>Points Per Game: ${player.PTS}</p>
                      <p>Assists Per Game: ${player.AST}</p>
                      <p>Rebounds Per Game: ${player.TRB}</p>
                      <p>Blocks Per Game: ${player.BLK}</p>
                      <p>2-point Field Goal Percentage: ${player['2P%']}</p>
                      <p>3-point Field Goal Percentage: ${player['3P%']}</p>
                      <p>Effective Field Goal Percentage: ${player['eFG%']}</p>
                      <p>Total Games Played: ${player['G']}</p>
                      <hr>`);
  });
}


function selectPlayer(d) {
  const index = selectedPlayers.findIndex(p => p.Player === d.Player);
  if (index > -1) {
    selectedPlayers.splice(index, 1); // Remove player if already selected
  } else if (selectedPlayers.length < 2) {
    selectedPlayers.push(d); // Add player if not already selected and less than 2 players are selected
  }
  updateScatterPlot(data); // Update the plot to reflect changes
  displayPlayerStats();
}
d3.select("#refreshButton").on("click", resetSelection);
function resetSelection() {
  selectedPlayers = [];
  updateScatterPlot(data);
  displayPlayerStats();
}

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
    .style("opacity", d => opacityScale(d['eFG%']))
    .on('click', function(event, d) {
      // Toggle player selection on click
      selectPlayer(d);

      // Redraw the circles to reflect selection changes
      d3.selectAll('circle')
        .style('stroke', 'none')
        .style('stroke-width', '0');

      // Highlight selected players
      selectedPlayers.forEach(sp => {
        d3.selectAll('circle')
          .filter(p => p.Player === sp.Player)
          .style('stroke', 'yellow')
          .style('stroke-width', '2');
      });
      selectedPlayers.forEach(sp => {
        tooltip.style('display', 'inline-block')
          .html(`<span style="font-size: larger; font-weight: bold;">Player: ${d.Player}</span><br/>
                  Team: ${d.Tm}<br/>
                  Age: ${d.Age}<br/>
                  Position: ${d.Pos}<br/>
                  Points Per Game: ${d.PTS}<br/>
                  Assists Per Game: ${d.AST}<br/>
                  Rebounds Per Game: ${d.TRB}<br/>
                  Blocks Per Game: ${d.BLK}<br/>
                  2-point Field Goal Percentage: ${d['2P%']}<br/>
                  3-point Field Goal Percentage: ${d['3P%']}<br/>
                  Effective Field Goal Percentage: ${d['eFG%']}<br/>
                  Total Games Played: ${d['G']}<br/>`)
          .style('left', `${event.pageX}px`)
          .style('top', `${event.pageY}px`);
    })
    .on('mouseover', function(event, d) {
      // Display tooltip only if less than 2 players are selected
      if (selectedPlayers.length < 2) {
        tooltip.style('display', 'inline-block')
          .html(`<span style="font-size: larger; font-weight: bold;">Player: ${d.Player}</span><br/>
                  Team: ${d.Tm}<br/>
                  Age: ${d.Age}<br/>
                  Position: ${d.Pos}<br/>
                  Points Per Game: ${d.PTS}<br/>
                  Assists Per Game: ${d.AST}<br/>
                  Rebounds Per Game: ${d.TRB}<br/>
                  Blocks Per Game: ${d.BLK}<br/>
                  2-point Field Goal Percentage: ${d['2P%']}<br/>
                  3-point Field Goal Percentage: ${d['3P%']}<br/>
                  Effective Field Goal Percentage: ${d['eFG%']}<br/>
                  Total Games Played: ${d['G']}<br/>`)
          .style('left', `${event.pageX}px`)
          .style('top', `${event.pageY}px`);
      }
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

  y = height - 150
  svg.append("text")
    .attr("x", width)
    .attr("y", y + 10)
    .style("font-size", "13px")
    .style("font-weight", "bold")
    .text("Positions");

  // Existing legend code
  let legend = svg.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(positions.slice(1)) // use positions array here
    .enter().append("g")
    .attr("transform", function (d, i) { return "translate(0," + (i * 20 + 20) + ")"; });  // Adjust y-position to leave room for title

  // Draw legend colored rectangles
  legend.append("rect")
    .attr("x", width)
    .attr("y", y)
    .attr("width", 19)
    .attr("height", 19)
    .attr("fill", colorScale);
  // encoding
  let positionNames = {
    "C": "Center",
    "SG": "Shooting Guard",
    "PF": "Power Forward",
    "PG": "Point Guard",
    "SF": "Small Forward"
  };
  // Draw legend text
  legend.append("text")
    .attr("x", width + 20)
    .attr("y", y + 10)
    .attr("dy", "0.28em")
    .style("text-anchor", "start") 
    .text(function (d) { return positionNames[d]; });

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

  function createSlider(target, values, initial, step) {
    return new rSlider({
      target: target,
      values: values,
      step: step,
      range: true,
      set: initial,
      tooltip: true,
      scale: false,
      labels: false,
      width: 250,
      onChange: function (values) {
        updateVisualization();
      }
    });
  }

  let minAge = d3.min(data, d => d.Age);
  let maxAge = d3.max(data, d => d.Age);
  let min2P = d3.min(data, d => d['2P%']);
  let max2P = d3.max(data, d => d['2P%']);
  let min3P = d3.min(data, d => d['3P%']);
  let max3P = d3.max(data, d => d['3P%']);
  var ageSlider = createSlider('#ageSlider', { min: minAge, max: maxAge }, [minAge, maxAge], 1);
  var twoPointSlider = createSlider('#twoPointSlider', { min: min2P, max: max2P }, [min2P, max2P], 0.01);
  var threePointSlider = createSlider('#threePointSlider', { min: min3P, max: max3P }, [min3P, max3P], 0.01);

  // Initialize data
  updateScatterPlot(data);

  // Function to filter data and update visualization
  function updateVisualization() {
    // Get current selections
    let selectedTeam = teamDropdown.node().value;
    let selectedPosition = posDropdown.node().value;
    let ageValues = ageSlider.getValue().split(',');
    let threePointValues = threePointSlider.getValue().split(',');
    let twoPointValues = twoPointSlider.getValue().split(',');
    console.log(ageValues);

    // Filter data based on selections
    let filtered_data = data.filter(function (d) {
      // console.log(d.Age, minAge, maxAge)
      return (
        (d.Tm === selectedTeam || selectedTeam === 'All') &&
        (d.Pos === selectedPosition || selectedPosition === 'All') &&
        (parseFloat(d.Age) >= parseFloat(ageValues[0]) && parseFloat(d.Age) <= parseFloat(ageValues[1])) &&
        (parseFloat(d['3P%']) >= parseFloat(threePointValues[0]) && parseFloat(d['3P%']) <= parseFloat(threePointValues[1])) &&
        (parseFloat(d['2P%']) >= parseFloat(twoPointValues[0]) && parseFloat(d['2P%']) <= parseFloat(twoPointValues[1]))
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