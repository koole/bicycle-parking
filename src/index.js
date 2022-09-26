import "./styles.css";
import worldmap from "./map";

import Cell from "./Cell";
import Agent from "./Agent"
import World from "./World"

const squareSize = 32;

// **********************************
// Read worldmap and create worldData
// **********************************

const world = new World(worldmap);

// **********************************
// This is where the simulation loop
// goes later or something
// **********************************


function gameTick() {
  // Move current agents
  world.tick();

  // Spawn new agent sometimes
  if(Math.random() < 0.2) {
    world.spawnAgent();
  }

  setTimeout(gameTick, 100);
}

gameTick();


// **********************************
// Draw world state to canvas
// **********************************

const gridWidth = world.state[0].length;
const gridHeight = world.state.length;

const canvasWidth = gridWidth * squareSize;
const canvasHeight = gridHeight * squareSize;
console.log(canvasWidth, canvasHeight);

var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
ctx.canvas.width = canvasWidth;
ctx.canvas.height = canvasHeight;

function drawCanvas() {
  for(const [y, row] of world.state.entries()) {
    for(const [x, cell] of row.entries()) {
      cell.draw(ctx, x, y, squareSize);
    }
  }
  requestAnimationFrame(drawCanvas);
}

requestAnimationFrame(drawCanvas);