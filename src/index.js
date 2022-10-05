import "./styles.css";
import worldmap, { mapDirection } from "./map";

import World from "./World";

const STRATEGIES = [
  "DEFAULT",
  "PARKING_LOT_PREFERENCE"
]

// Set default selected strategies
let selectedStrategies = [
  "DEFAULT",
  // "PARKING_LOT_PREFERENCE"
];

var timeToParkData = [selectedStrategies];
var timeToGoalData = [selectedStrategies];

function reset() {
  world = new World(worldmap, mapDirection);
  timeToParkData = [selectedStrategies];
  timeToGoalData = [selectedStrategies];
  DrawChart('time-to-park', timeToParkData);
  DrawChart('time-to-goal', timeToGoalData);
}

function strategyName(strategy) {
  return strategy.toLowerCase().replace(/^_*(.)|_+(.)/g, (s, c, d) => c ? c.toUpperCase() : ' ' + d.toUpperCase());
}

const squareSize = 32;

let tickdelay = 20;
let spawnspeed = 0.2;
let paused = false;
var realtimeChart = true;

// **********************************
// Controls
// **********************************

// Reset button
document.getElementById("reset").addEventListener("click", () => {
  reset();
});

// Create HTML checkboxes for each strategy, and add them and remove them to selectedStrategies when enabled/disabled
const strategyCheckboxes = document.getElementById("strategy-checkboxes");
STRATEGIES.forEach(strategy => {
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
      selectedStrategies = selectedStrategies.filter(s => s !== strategy);
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

// Control if the chart is updated in realtime
const realtimeChartCheckbox = document.getElementById("realtime-charts");
realtimeChartCheckbox.addEventListener("change", () => {
  if (realtimeChartCheckbox.checked) {
    realtimeChart = true;
  } else {
    realtimeChart = false;
  }
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
    if (Math.random() < spawnspeed) {
      // Pick random strategy from selectedStrategies
      if (selectedStrategies.length > 0) {
        const strategy = selectedStrategies[Math.floor(Math.random() * selectedStrategies.length)];
        world.spawnAgent(strategy);
      }
    }

    // Move current agents
    world.tick();
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

function drawCanvas() {
  for (const [y, row] of world.state.entries()) {
    for (const [x, cell] of row.entries()) {
      cell.draw(ctx, x, y, squareSize);
    }
  }
  requestAnimationFrame(drawCanvas);
}

requestAnimationFrame(drawCanvas);

// **********************************
// Draw graphs for time-to-park and time-to-goal
// **********************************

google.charts.load('current', { 'packages': ['corechart'] });
google.charts.setOnLoadCallback(() => DrawChart('time-to-park', timeToParkData));

function DrawChart(id, data) {

  // Create the data table.
  var data = google.visualization.arrayToDataTable(data);

  // Set chart options
  var options = {
    'width': "100%",
    'height': 300,
    bar: { gap: 0 },
    chartArea: { 'width': '100%', 'height': '80%' },
    legend: { 'position': 'bottom' },
    interpolateNulls: false,
    histogram: {
      maxNumBuckets: 50,
      minValue: 0,
      maxValue: 150
    }
  };

  // Instantiate and draw our chart, passing in some options.
  var chart = new google.visualization.Histogram(document.getElementById(id));
  chart.draw(data, options);
}

export function addTimeToPark(strategy, data) {
  // Create array of 0's, with length of number of strategies,
  // and set the index of the strategy to the data 
  const index = selectedStrategies.indexOf(strategy)
  const row = Array(selectedStrategies.length).fill(null);
  row[index] = data;
  timeToParkData.push(row);
  if (realtimeChart) {
    DrawChart('time-to-park', timeToParkData);
  }
}

export function addTimeToGoal(strategy, data) {
  const index = selectedStrategies.indexOf(strategy)
  const row = Array(selectedStrategies.length).fill(null);
  row[index] = data;
  timeToGoalData.push(row);
  if (realtimeChart) {
    DrawChart('time-to-goal', timeToGoalData);
  }
}
