import "./styles.css";
import worldmap, { mapDirection } from "./map";

import World from "./World";

const STRATEGIES = [
  "DEFAULT",
  "lotPref",
  "closest",
];

// Set default selected strategies
let selectedStrategies = [
  "DEFAULT",
  "lotPref",
  "closest",
];

var csvRowsPark = "strategy,time\n";
var csvRowsGoal = "strategy,time\n";

var timeToParkData = [selectedStrategies];
var timeToGoalData = [selectedStrategies];

var experimentMode = false;
const experiment_ticks = 10000;

var currentTick = 0;

function reset() {
  world = new World(worldmap, mapDirection);
  timeToParkData = [selectedStrategies];
  timeToGoalData = [selectedStrategies];
  csvRowsPark = "strategy,time\n";
  csvRowsGoal = "strategy,time\n";
  currentTick = 0;
  experimentMode = false;
}

function strategyName(strategy) {
  return strategy
    .toLowerCase()
    .replace(/^_*(.)|_+(.)/g, (s, c, d) =>
      c ? c.toUpperCase() : " " + d.toUpperCase()
    );
}

const squareSize = 32;

let tickdelay = 20;
let spawnspeed = 0.2;
let paused = false;

// Onclick of #experiment-mode, start experiment
document.getElementById("experiment-mode").onclick = function () {
  reset();
  experimentMode = true;
  paused = false;
}


// **********************************
// Controls
// **********************************

// Spawn rate waves
export const automated_loop_length = 500;
const min_spawn_rate = 0.2;
var max_spawn_rate = 1;
const max_limit = 1;

// return value for current bin using sine wave between min and max, over length of automated_loop_length
function getSpawnRate(current_bin) {
  return min_spawn_rate + (max_spawn_rate - min_spawn_rate) * Math.pow((Math.sin((current_bin / automated_loop_length) * 2 * Math.PI) + 1) / 2, 2);
}

// Create array of spawn rates of length automated_loop_length
let spawn_rates = []
function updateSpawnRates() {
  spawn_rates = [];
  for (var i = 0; i < automated_loop_length; i++) {
    spawn_rates.push(getSpawnRate(i));
  }
}
updateSpawnRates();

// Draw bars for spawn_rate on canvas
function drawSpawnRate(currentTick) {
  document.getElementById("automated-spawn-rate-display").innerHTML = Math.floor(spawn_rates[currentTick % automated_loop_length] * 100) + "%";
  const canvas = document.getElementById("spawn-rate");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const barWidth = width / automated_loop_length;
  const barHeight = height / max_limit;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fbe7a5";
  ctx.fillRect(0, 0, width, height);
  for (var i = 0; i < automated_loop_length; i++) {
    ctx.fillStyle = "#f6c344";
    ctx.fillRect(i * barWidth, height - spawn_rates[i] * barHeight, barWidth, spawn_rates[i] * barHeight);
  }
  const currentI = (currentTick % automated_loop_length)
  ctx.fillStyle = "#312708";
  ctx.fillRect(currentI * barWidth, height - spawn_rates[currentI] * barHeight - 2, barWidth * 4, spawn_rates[currentI] * barHeight + 2);
}
drawSpawnRate(currentTick);

let spawn_rate_type = "auto";

// Switch between spawn rate types
document.getElementById("spawnrate-radio-auto").addEventListener("change", function (event) {
  spawn_rate_type = event.target.value;
  document.getElementById("spawnspeed").disabled = true;
});
document.getElementById("spawnrate-radio-manual").addEventListener("change", function (event) {
  spawn_rate_type = event.target.value;
  document.getElementById("spawnspeed").disabled = false;
});

// Switch between max_spawn_rate value
document.getElementById("automatedPeak1").addEventListener("change", function (event) {
  max_spawn_rate = 1;
  updateSpawnRates();
});
document.getElementById("automatedPeak2").addEventListener("change", function (event) {
  max_spawn_rate = 0.66;
  updateSpawnRates();
});
document.getElementById("automatedPeak3").addEventListener("change", function (event) {
  max_spawn_rate = 0.33;
  updateSpawnRates();
});



// Reset button
document.getElementById("reset").addEventListener("click", () => {
  reset();
});

// Create HTML checkboxes for each strategy, and add them and remove them to selectedStrategies when enabled/disabled
const strategyCheckboxes = document.getElementById("strategy-checkboxes");
STRATEGIES.forEach((strategy) => {
  const container = document.createElement("div");
  container.classList.add("form-check");
  const checkbox = document.createElement("input");
  checkbox.classList.add("form-check-input");
  checkbox.type = "checkbox";
  checkbox.id = strategy;
  // Check the box if it's in selectedStrategies
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
  label.appendChild(document.createTextNode(strategyName(strategy)));
  strategyCheckboxes.appendChild(container);
  container.appendChild(checkbox);
  container.appendChild(label);
});

// Control play/pause button
document.getElementById("play-pause").addEventListener("click", () => {
  if (document.getElementById("play-pause").innerHTML === "Play") {
    document.getElementById("play-pause").innerHTML = "Pause";
    paused = false;
  } else {
    document.getElementById("play-pause").innerHTML = "Play";
    paused = true;
  }
});

// Control tickdelay
document.getElementById("tickdelay").addEventListener("input", (e) => {
  tickdelay = e.target.value;
});

document.getElementById("spawnspeed").addEventListener("input", (e) => {
  spawnspeed = e.target.value;
  document.getElementById("manual-spawn-rate-display").innerHTML = Math.round(spawnspeed * 100) + "%";
});

// **********************************
// Read worldmap and create worldData
// **********************************

let world = new World(worldmap, mapDirection);

// **********************************
// This is where the simulation loop
// goes later or something
// **********************************

function gameTick() {
  if (!paused) {
    // Spawn new agent sometimes
    let rate = spawnspeed;
    if (spawn_rate_type === "auto") {
      rate = spawn_rates[currentTick % automated_loop_length];
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
      document.getElementById("experiment-progress").style.width = (currentTick / experiment_ticks) * 100 + "%";
    }
    if (experimentMode && currentTick > experiment_ticks) {
      openResultsModal();
      document.getElementById("experiment-progress").style.width = "0%";
      experimentMode = false;
    }
  }
  setTimeout(gameTick, tickdelay);
}

gameTick();

// **********************************
// Draw world state to canvas
// **********************************

const gridWidth = world.state[0].length;
const gridHeight = world.state.length;

const canvasWidth = gridWidth * squareSize;
const canvasHeight = gridHeight * squareSize;

var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
ctx.canvas.width = canvasWidth;
ctx.canvas.height = canvasHeight;

// Control variables using checkboxes
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
// Draw graphs for time-to-park and time-to-goal
// **********************************

google.charts.load("current", { packages: ["corechart"] });
google.charts.setOnLoadCallback(() => {
  DrawChart("time-to-park", timeToParkData, 0);
  DrawChart("time-to-goal", timeToGoalData, 0);
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
  document.getElementById("resultsModal").style.display = "block";
  document.getElementById("resultsModalBackdrop").style.display = "block";
  paused = true;
}

function closeResultsModal() {
  document.getElementById("resultsModal").style.display = "none";
  document.getElementById("resultsModalBackdrop").style.display = "none";
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
    chartArea: { left: 10, top: 0 },
    histogram: {
      maxNumBuckets: 50,
      minValue: 0,
      maxValue: max + 40,
    },
  };

  // Instantiate and draw our chart, passing in some options.
  var chart = new google.visualization.Histogram(document.getElementById(id));
  chart.draw(data, options);
}

export function addTimeToPark(strategy, data) {
  // Create array of 0's, with length of number of strategies,
  // and set the index of the strategy to the data
  const index = selectedStrategies.indexOf(strategy);
  const row = Array(selectedStrategies.length).fill(null);
  row[index] = data;
  timeToParkData.push(row);
  csvRowsPark += (`${strategy},${data}\n`)
}

export function addTimeToGoal(strategy, data) {
  const index = selectedStrategies.indexOf(strategy);
  const row = Array(selectedStrategies.length).fill(null);
  row[index] = data;
  timeToGoalData.push(row);
  csvRowsGoal += (`${strategy},${data}\n`)
}

// When button with id "export-park" is clicked, download the csv file with the data
document.getElementById("export-park").addEventListener("click", () => {
  downloadCSV(csvRowsPark, `time-to-park`);
}
);

// When button with id "export-goal" is clicked, download the csv file with the data
document.getElementById("export-goal").addEventListener("click", () => {
  downloadCSV(csvRowsGoal, `time-to-goal`);
}
);

// Function to download the csv file
function downloadCSV(csv, filename) {
  var csvFile;
  var downloadLink;

  // CSV file
  csvFile = new Blob([csv], { type: "text/csv" });
  downloadLink = document.createElement("a");
  downloadLink.download = filename + `===${selectedStrategies.join("-")}===peak-${max_spawn_rate}.csv`;

  // Add hidden download link
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
}