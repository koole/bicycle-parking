const MAX_BIKES = 8;
class Cell {
  constructor(world, type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.agents = [];
    this.bikes = 0;
  }

  addAgent(agent) {
    this.agents.push(agent);
  }

  removeAgent(agent) {
    this.agents = this.agents.filter(a => a !== agent);
  }

  canPark() {
    return this.type === "PARKING" && this.bikes < MAX_BIKES;
  }

  addBike() {
    this.bikes++;
  }

  removeBike() {
    this.bikes--;
  }

  draw(ctx, x, y, squareSize) {
    const canvas_x = x * squareSize;
    const canvas_y = y * squareSize;

    let color = "#fefefe";

    switch(this.type) {
      case "SPAWN": 
        color = "#d65451";
        break;
      case "BIKE_PATH":
        color = "#ebb3b3";
        break;
      case "PEDESTRIAN_PATH":
        color = "#dbdddb";
        break;
      case "ALL_PATH":
        color = "#9c9c9b";
        break;
      case "PARKING":
        color = "#696059";
        break;
      case "EMPTY":
        color = "#dae6c5";
        break;
      case "BUILDING":
        color = "#84b0c5";
        break;
      case "BUILDING_ENTRANCE":
        color = "#5397b8";
        break;
    }

    ctx.fillStyle = color;
    ctx.fillRect(canvas_x, canvas_y, squareSize, squareSize);

    if(["SPAWN", "BIKE_PATH", "PEDESTRIAN_PATH", "ALL_PATH", "PARKING", "BUILDING_ENTRANCE"].includes(this.type)) {
      ctx.font = '12px monospace';
      ctx.fillStyle = "black";
      // make text slightly transparent
      ctx.globalAlpha = 0.3;
      ctx.fillText("B:" + this.agents.filter(({type}) => type === "BIKE").length, canvas_x + 2, canvas_y + 12);
      ctx.fillText("P:" + this.agents.filter(({type}) => type === "PEDESTRIAN").length, canvas_x + 2, canvas_y + 24);
      // reset transparency
      ctx.globalAlpha = 1;
    }
  
    // Draw progress bar for amount of parked bikes
    if(this.type === "PARKING") {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = "#00ff00";
      ctx.fillRect(canvas_x, canvas_y + squareSize - 4, squareSize, 4);
      ctx.globalAlpha = 1;

      ctx.fillStyle = "#00ff00";
      ctx.fillRect(canvas_x, canvas_y + squareSize - 4, squareSize * (this.bikes / MAX_BIKES), 4);
    }
  }
}

export default Cell;