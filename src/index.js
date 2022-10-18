import "./styles.css";
import worldmap, { mapDirection } from "./map";

import World from "./World";

// **********************************
// Static config variables
// **********************************
const experimentTicks = 10000;
const automatedLoopLength = 500;
const maxSpawnRateLimit = 1;

// **********************************
// Parameter variable setup
// **********************************

const STRATEGIES = ["SMART", "RANDOM", "CLOSEST"];

// Set default selected strategies
let selectedStrategies = ["SMART", "RANDOM", "CLOSEST"];

var currentTick = 0;

var csvRowsPark = "strategy,time\n";
var csvRowsGoal = "strategy,time\n";

var timeToParkData = [selectedStrategies];
var timeToGoalData = [selectedStrategies];
var trendData = {};
// Add key to trendData for selectedStrategies
function clearTrendData() {
  trendData = {};
  selectedStrategies.forEach((strategy) => {
    trendData[strategy] = [];
  });
}
clearTrendData();

var experimentMode = false;

let spawnRateType = "auto";

// Config for automated spawn rate
const minSpawnRate = 0.2;
var maxSpawnRate = 1;

// Default tickDelay and spawnspeed
let tickDelay = 20;
let oldTickDelay = tickDelay;
let spawnspeed = 0.2;

let paused = false;

// **********************************
// Utility functions
// **********************************

// Reset keeps current settings, but clears the world and restarts the simulation
function reset() {
  world = new World(worldmap, mapDirection);
  timeToParkData = [selectedStrategies];
  timeToGoalData = [selectedStrategies];
  clearTrendData();
  csvRowsPark = "strategy,time\n";
  csvRowsGoal = "strategy,time\n";
  currentTick = 0;
  experimentMode = false;
}

// Turns stragegy name into a nice display name
function strategyName(strategy) {
  return strategy
    .toLowerCase()
    .replace(/^_*(.)|_+(.)/g, (s, c, d) =>
      c ? c.toUpperCase() : " " + d.toUpperCase()
    );
}

// Onclick of #experiment-mode, start experiment
document.getElementById("experiment-mode").onclick = function () {
  reset();
  tickDelay = 0;
  experimentMode = true;
  paused = false;
};

// **********************************
// User Controls
// **********************************

// -- Spawn rate control
// **********************************

// return value for current bin using sine wave between min and max, over length of automatedLoopLength
function getSpawnRate(currentBin) {
  return (
    minSpawnRate +
    (maxSpawnRate - minSpawnRate) *
      Math.pow(
        (Math.sin((currentBin / automatedLoopLength) * 2 * Math.PI) + 1) / 2,
        2
      )
  );
}

// Create array of spawn rates of length automated_loop_length
let spawnRates = [];
function updateSpawnRates() {
  spawnRates = [];
  for (var i = 0; i < automatedLoopLength; i++) {
    spawnRates.push(getSpawnRate(i));
  }
}
updateSpawnRates();

// Draw bars for spawn_rate on canvas
function drawSpawnRate(currentTick) {
  document.getElementById("automated-spawn-rate-display").innerHTML =
    Math.floor(spawnRates[currentTick % automatedLoopLength] * 100) + "%";
  const canvas = document.getElementById("spawn-rate");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const barWidth = width / automatedLoopLength;
  const barHeight = height / maxSpawnRateLimit;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fbe7a5";
  ctx.fillRect(0, 0, width, height);

  // Plot bar for spawn rate at corresponding tick
  for (var i = 0; i < automatedLoopLength; i++) {
    ctx.fillStyle = "#f6c344";
    ctx.fillRect(
      i * barWidth,
      height - spawnRates[i] * barHeight,
      barWidth,
      spawnRates[i] * barHeight
    );
  }

  // Plot a line every 20%
  for (var i = 0; i < maxSpawnRateLimit; i += 0.2) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#c49c35";
    ctx.beginPath();
    ctx.moveTo(0, height - i * barHeight);
    ctx.lineTo(width, height - i * barHeight);
    ctx.stroke();
    // Add text
    ctx.fillStyle = "#c49c35";
    ctx.font = "20px Arial";
    ctx.fillText(
      Math.floor(i * 100) + "%",
      width - 42,
      height - i * barHeight - 3
    );
  }

  // Plot the current spawn rate
  const currentIndex = currentTick % automatedLoopLength;
  ctx.fillStyle = "#312708";
  ctx.fillRect(
    currentIndex * barWidth,
    height - spawnRates[currentIndex] * barHeight - 2,
    barWidth * 4,
    spawnRates[currentIndex] * barHeight + 2
  );
  // Draw small circle on top of line
  ctx.beginPath();
  ctx.arc(
    currentIndex * barWidth + barWidth * 2,
    height - spawnRates[currentIndex] * barHeight,
    5,
    0,
    2 * Math.PI
  );
  ctx.fill();
}
drawSpawnRate(currentTick);

document.getElementById("spawnspeed").addEventListener("input", (e) => {
  spawnspeed = e.target.value;
  document.getElementById("manual-spawn-rate-display").innerHTML =
    Math.round(spawnspeed * 100) + "%";
});

// Switch between spawn rate types
document
  .getElementById("spawnrate-radio-auto")
  .addEventListener("change", function (event) {
    spawnRateType = event.target.value;
    document.getElementById("spawnspeed").disabled = true;
  });
document
  .getElementById("spawnrate-radio-manual")
  .addEventListener("change", function (event) {
    spawnRateType = event.target.value;
    document.getElementById("spawnspeed").disabled = false;
  });

// Switch between max_spawn_rate value
document
  .getElementById("automatedPeak1")
  .addEventListener("change", function (event) {
    maxSpawnRate = 1;
    updateSpawnRates();
  });
document
  .getElementById("automatedPeak2")
  .addEventListener("change", function (event) {
    maxSpawnRate = 0.66;
    updateSpawnRates();
  });
document
  .getElementById("automatedPeak3")
  .addEventListener("change", function (event) {
    maxSpawnRate = 0.33;
    updateSpawnRates();
  });

// -- Reset button
// **********************************

document.getElementById("reset").addEventListener("click", () => {
  reset();
});

// -- Strategy selection
// **********************************

// Create HTML checkboxes for each strategy, and add them and remove them to selectedStrategies when enabled/disabled
const strategyCheckboxes = document.getElementById("strategy-checkboxes");
STRATEGIES.forEach((strategy) => {
  const container = document.createElement("li");
  container.classList.add("list-group-item");
  const checkbox = document.createElement("input");
  checkbox.classList.add("form-check-input");
  checkbox.classList.add("me-2");
  checkbox.type = "checkbox";
  checkbox.id = strategy;
  checkbox.checked = selectedStrategies.includes(strategy);
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      selectedStrategies.push(strategy);
    } else {
      selectedStrategies = selectedStrategies.filter((s) => s !== strategy);
    }
    reset();
  });
  const label = document.createElement("label");
  label.htmlFor = strategy;
  label.classList.add("form-check-label");
  label.classList.add("stretched-link");
  label.appendChild(document.createTextNode(strategyName(strategy)));
  strategyCheckboxes.appendChild(container);
  container.appendChild(checkbox);
  container.appendChild(label);
});

// -- Play/pause button
// **********************************

document.getElementById("play-pause").addEventListener("click", () => {
  if (document.getElementById("play-pause").innerHTML === "Play") {
    document.getElementById("play-pause").innerHTML = "Pause";
    paused = false;
  } else {
    document.getElementById("play-pause").innerHTML = "Play";
    paused = true;
  }
});

// -- Tickdelay
// **********************************
document.getElementById("tickdelay").addEventListener("input", (e) => {
  tickDelay = e.target.value;
});

// -- Display options
// **********************************
var drawDirection = false;
var drawCoords = false;
var drawCount = false;

document.getElementById("draw-direction").addEventListener("change", (e) => {
  drawDirection = e.target.checked;
});
document.getElementById("draw-coords").addEventListener("change", (e) => {
  drawCoords = e.target.checked;
});
document.getElementById("draw-count").addEventListener("change", (e) => {
  drawCount = e.target.checked;
});

// **********************************
// Data gathering functions used by the agents
// **********************************

export function addTimeToPark(strategy, data) {
  const index = selectedStrategies.indexOf(strategy);
  const row = Array(selectedStrategies.length).fill(null);
  row[index] = data;
  timeToParkData.push(row);
  csvRowsPark += `${strategy},${data}\n`;
}

export function addTimeToGoal(strategy, data) {
  const index = selectedStrategies.indexOf(strategy);
  const row = Array(selectedStrategies.length).fill(null);
  row[index] = data;
  timeToGoalData.push(row);
  trendData[strategy].push(data);
  csvRowsGoal += `${strategy},${data}\n`;
}

// **********************************
// Results modal
// **********************************

google.charts.load("current", { packages: ["corechart"] });
google.charts.setOnLoadCallback(() => {
  DrawChart("time-to-park", timeToParkData, 0);
  DrawChart("time-to-goal", timeToGoalData, 0);
  DrawTrend(trendData);
});
// Render charts onclick of #render-charts
document.getElementById("render-charts").addEventListener("click", () => {
  openResultsModal();
});
document.getElementById("closeResultsModal").addEventListener("click", () => {
  closeResultsModal();
});

function openResultsModal() {
  // Get maximum value of combined timeToParkData and timeToGoalData
  let max = 0;
  timeToParkData.forEach((row) => {
    if (row[1] > max) {
      max = row[1];
    }
  });
  timeToGoalData.forEach((row) => {
    if (row[1] > max) {
      max = row[1];
    }
  });

  DrawChart("time-to-park", timeToParkData, max);
  DrawChart("time-to-goal", timeToGoalData, max);
  DrawTrend(trendData);
  document.getElementById("resultsModal").style.display = "block";
  document.getElementById("resultsModalBackdrop").style.display = "block";
  oldTickDelay = tickDelay;
  paused = true;
}
function closeResultsModal() {
  document.getElementById("resultsModal").style.display = "none";
  document.getElementById("resultsModalBackdrop").style.display = "none";
  tickDelay = oldTickDelay;
  paused = false;
}

function DrawChart(id, data, max) {
  // Create the data table.
  var data = google.visualization.arrayToDataTable(data);

  // Set chart options
  var options = {
    width: "1100",
    height: 300,
    bar: { gap: 0 },
    interpolateNulls: false,
    chartArea: { left: 10, top: 0, bottom: 35 },
    histogram: {
      bucketSize: 20,
      maxNumBuckets: 50,
      minValue: 0,
      maxValue: max,
      lastBucketPercentile: 5,
    },
  };

  // Instantiate and draw our chart, passing in some options.
  var chart = new google.visualization.Histogram(document.getElementById(id));
  chart.draw(data, options);
}

function DrawTrend(data) {
  // Create new data table, with a column for each strategy
  const dataRows = [];
  const strategies = Object.keys(data);
  // Average the data for each strategy per `automatedLoopLength` ticks
  strategies.forEach((strategy) => {
    const strategyData = data[strategy];
    const averagedData = [];
    for (let i = 0; i < strategyData.length; i += automatedLoopLength) {
      const slice = strategyData.slice(i, i + automatedLoopLength);
      const average = slice.reduce((a, b) => a + b, 0) / slice.length;
      averagedData.push(average);
    }
    dataRows.push(averagedData);
  });

  console.log(dataRows);

  // Find strategy with most data points, loop over this and create a row for each datapoint for all strategies at this index
  const maxDataPoints = Math.max(...dataRows.map((row) => row.length));
  const dataCombined = [];
  for (let i = 0; i < maxDataPoints; i++) {
    const row = [];
    strategies.forEach((strategy, index) => {
      row.push(dataRows[index][i] || null);
    });
    dataCombined.push(row);
  }

  const dataColumns = [["X", ...strategies]];
  dataCombined.forEach((row, index) => {
    dataColumns.push([index, ...row]);
  });
  console.log(dataCombined);
  var data = google.visualization.arrayToDataTable(dataColumns);

  console.log(data);
  // Trendline configuration for each strategy
  const trendlines = {};
  strategies.forEach((strategy, i) => {
    trendlines[i] = {
      type: "exponential",
      visibleInLegend: true,
      // opacity: 1,
    };
  });

  var trendOptions = {
    width: "1100",
    height: 300,
    bar: { gap: 0 },
    interpolateNulls: false,
    chartArea: { left: 10, top: 0, bottom: 35 },
    trendlines: trendlines,
    // dataOpacity: 0.1,
    explorer: {},
  };
  var trendChart = new google.visualization.LineChart(
    document.getElementById("trend-time-to-goal")
  );
  trendChart.draw(data, trendOptions);
}

// **********************************
// Read worldmap and create worldData
// **********************************

let world = new World(worldmap, mapDirection);

// **********************************
// This runs the simulation loop every tick
// **********************************

function gameTick() {
  if (!paused) {
    // Spawn new agent sometimes
    let rate = spawnspeed;
    if (spawnRateType === "auto") {
      rate = spawnRates[currentTick % automatedLoopLength];
    }

    if (Math.random() < rate) {
      // Pick random strategy from selectedStrategies
      if (selectedStrategies.length > 0) {
        const strategy =
          selectedStrategies[
            Math.floor(Math.random() * selectedStrategies.length)
          ];
        world.spawnAgent(strategy);
      }
    }

    // Move current agents
    world.tick();
    currentTick++;
    drawSpawnRate(currentTick);
    if (experimentMode) {
      document.getElementById("experiment-progress").style.width =
        (currentTick / experimentTicks) * 100 + "%";
    }
    if (experimentMode && currentTick > experimentTicks) {
      openResultsModal();
      document.getElementById("experiment-progress").style.width = "0%";
      experimentMode = false;
    }
  }

  if(tickDelay > 0 ) {
    setTimeout(gameTick, tickDelay);
  } else {
    if(currentTick % 10 === 0) {
      setTimeout(gameTick, 0);
    } else {
      gameTick();
    }
  }
}

gameTick();

// **********************************
// Draw world state to canvas
// **********************************

const squareSize = 32;

const gridWidth = world.state[0].length;
const gridHeight = world.state.length;

const canvasWidth = gridWidth * squareSize;
const canvasHeight = gridHeight * squareSize;

var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
ctx.canvas.width = canvasWidth;
ctx.canvas.height = canvasHeight;

function drawCanvas() {
  for (const [y, row] of world.state.entries()) {
    for (const [x, cell] of row.entries()) {
      cell.draw(ctx, x, y, squareSize, drawDirection, drawCoords, drawCount);
    }
  }
  requestAnimationFrame(drawCanvas);
}

requestAnimationFrame(drawCanvas);

// **********************************
// Download CSV data to file
// **********************************

// When button with id "export-park" is clicked, download the csv file with the data
document.getElementById("export-park").addEventListener("click", () => {
  downloadCSV(csvRowsPark, `time-to-park`);
});
// When button with id "export-goal" is clicked, download the csv file with the data
document.getElementById("export-goal").addEventListener("click", () => {
  downloadCSV(csvRowsGoal, `time-to-goal`);
});
// Function to download the csv file
function downloadCSV(csv, filename) {
  var csvFile;
  var downloadLink;

  // CSV file
  csvFile = new Blob([csv], { type: "text/csv" });
  downloadLink = document.createElement("a");
  downloadLink.download =
    filename + `===${selectedStrategies.join("-")}===peak-${maxSpawnRate}.csv`;

  // Add hidden download link
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
}
