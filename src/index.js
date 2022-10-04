import "./styles.css";
import worldmap, { mapDirection } from "./map";

import World from "./World";

const squareSize = 32;

let tickdelay = 100;
let spawnspeed = 0.2;
let paused = false;

// **********************************
// Controls
// **********************************

// Control play/pause button with "play-pause" id
document.getElementById("play-pause").addEventListener("click", () => {
  if (document.getElementById("play-pause").innerHTML === "Play") {
    document.getElementById("play-pause").innerHTML = "Pause";
    paused = false;
  } else {
    document.getElementById("play-pause").innerHTML = "Play";
    paused = true;
  }
});

// Control tickdelay using range input with id "tickdelay"
document.getElementById("tickdelay").addEventListener("input", (e) => {
  tickdelay = e.target.value;
});

document.getElementById("spawnspeed").addEventListener("input", (e) => {
  spawnspeed = e.target.value;
});

// **********************************
// Read worldmap and create worldData
// **********************************

const world = new World(worldmap, mapDirection);

// **********************************
// This is where the simulation loop
// goes later or something
// **********************************

function gameTick() {
  if (!paused) {
    // Spawn new agent sometimes
    if (Math.random() < spawnspeed) {
      world.spawnAgent("TEST_STRATEGY");
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

const timeToParkCanvas = document.getElementById('time-to-park').getContext('2d');
const timeToGoalCanvas = document.getElementById('time-to-goal').getContext('2d');

const timeToParkChart = new Chart(timeToParkCanvas, {
  type: 'line',
  data: {
    datasets: [{
      label: 'Time to park',
      data: [],
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
      pointStyle: "cross"
    }]
  },
  options: {
    animation: false,
    spanGaps: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    },
    datasets: {
      line: {
        pointRadius: 0
      }
    },
  }
});

const timeToGoalChart = new Chart(timeToGoalCanvas, {
  type: 'line',
  data: {
    datasets: [{
      label: 'Time to goal',
      data: [],
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
      pointStyle: "cross"
    }]
  },
  options: {
    animation: false,
    spanGaps: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    },
    datasets: {
      line: {
        pointRadius: 0
      }
    },
  }
});


export function addTimeToPark(data) {
  timeToParkChart.data.labels.push(timeToParkChart.data.labels.length);
  timeToParkChart.data.datasets.forEach((dataset) => {
    dataset.data.push(data);
  });
  timeToParkChart.update();
}

export function addTimeToGoal(data) {
  timeToGoalChart.data.labels.push(timeToGoalChart.data.labels.length);
  timeToGoalChart.data.datasets.forEach((dataset) => {
    dataset.data.push(data);
  });
  timeToGoalChart.update();
}

