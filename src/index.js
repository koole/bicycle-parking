import "./styles.css";
import worldmap from "./map";

import World from "./World";

const squareSize = 32;

let tickdelay = 100;
let spawnspeed = 0.2;

// **********************************
// Controls
// **********************************

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

const world = new World(worldmap);

// **********************************
// This is where the simulation loop
// goes later or something
// **********************************

function gameTick() {
  // Spawn new agent sometimes
  if (Math.random() < spawnspeed) {
    world.spawnAgent("TEST_STRATEGY");
  }

  // Move current agents
  world.tick();

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
