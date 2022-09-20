import "./styles.css";
import worldmap from "./map";

const worldData = [];

const squareSize = 32;

const rows = worldmap.split("\n");

for (const row of rows) {
  const rowData = [...row].map((c) => {
    console.log(c);
    return c;
  });
  worldData.push(rowData);
}

const gridHeight = rows.length;
const gridWidth = rows[0].length;

const canvasWidth = gridWidth * squareSize;
const canvasHeight = gridHeight * squareSize;

var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
ctx.canvas.width = canvasWidth;
ctx.canvas.height = canvasHeight;

ctx.moveTo(0, 0);
ctx.lineTo(canvasWidth, canvasHeight);
ctx.stroke();
