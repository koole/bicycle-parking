const MAX_PARKED_BIKES = 8;

class Cell {
  constructor(world, type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.agents = [];
    this.bikes = 0;
  }

  // Check if agent can be added to this cell
  checkAddAgent(agent) {
    if(this.type === "BUILDING_ENTRANCE" && agent.type === "PEDESTRIAN") {
      return true;
    }
    // Allow a maximum of:
    // 2 agents of type BIKE
    // or 3 agents of type PEDESTRIAN 
    // or 1 agent of type BIKE and 2 agents of type PEDESTRIAN
    if(agent.type === "BIKE" && this.agents.filter(({type}) => type === "BIKE").length >= 2) {
      return false;
    }
    if(agent.type === "PEDESTRIAN" && this.agents.filter(({type}) => type === "PEDESTRIAN").length >= 3) {
      return false;
    }
    if(agent.type === "BIKE" && this.agents.filter(({type}) => type === "PEDESTRIAN").length >= 2) {
      return false;
    }
    if(agent.type === "PEDESTRIAN" && this.agents.filter(({type}) => type === "BIKE").length >= 1) {
      return false;
    }
    return true;
  }

  addAgent(agent) {
    this.agents.push(agent);
  }

  removeAgent(agent) {
    this.agents = this.agents.filter(a => a !== agent);
  }

  canPark() {
    return this.type === "PARKING" && this.bikes < MAX_PARKED_BIKES;
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

    color = this.getCellColor(color);

    ctx.fillStyle = color;
    ctx.fillRect(canvas_x, canvas_y, squareSize, squareSize);
  
    // Draw progress bar for amount of parked bikes
    if(this.type === "PARKING") {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = "#00ff00";
      ctx.fillRect(canvas_x, canvas_y + squareSize - 4, squareSize, 4);
      ctx.globalAlpha = 1;

      ctx.fillStyle = "#00ff00";
      ctx.fillRect(canvas_x, canvas_y + squareSize - 4, squareSize * (this.bikes / MAX_PARKED_BIKES), 4);
    }

    if(this.type === "BUILDING_ENTRANCE") {
      ctx.fillStyle = "#000000";
      ctx.font = '12px monospace';
      ctx.fillText("" + this.agents.filter(({type}) => type === "PEDESTRIAN").length, canvas_x + 2, canvas_y + 24);
    } else {
      const bikeAgents = this.agents.filter(({type}) => type === "BIKE");
      const pedestrianAgents = this.agents.filter(({type}) => type === "PEDESTRIAN");
      if(bikeAgents.length > 0) {
        bikeAgents.forEach((agent, i) => {
          this.drawBike(ctx, x * squareSize + i * 10, y * squareSize);
        });
        if(pedestrianAgents.length > 0) {
          pedestrianAgents.forEach((agent, i) => {
            this.drawPedestrian(ctx, x * squareSize + 10, y * squareSize + i * 10);
          });
        }
      } else if(pedestrianAgents.length > 0) {
        pedestrianAgents.forEach((agent, i) => {
          if(i < 2) {
            this.drawPedestrian(ctx, x * squareSize + i * 10, y * squareSize);
          } else {
            this.drawPedestrian(ctx, x * squareSize + 5, y * squareSize + 10);
          }
        });
      }
    }

    // !! Debug to show number of agents in cell
    // if(["SPAWN", "BIKE_PATH", "PEDESTRIAN_PATH", "ALL_PATH", "PARKING", "BUILDING_ENTRANCE"].includes(this.type)) {
    //   ctx.font = '12px monospace';
    //   ctx.fillStyle = "black";
    //   // make text slightly transparent
    //   ctx.globalAlpha = 0.3;
    //   ctx.fillText("B:" + this.agents.filter(({type}) => type === "BIKE").length, canvas_x + 2, canvas_y + 12);
    //   ctx.fillText("P:" + this.agents.filter(({type}) => type === "PEDESTRIAN").length, canvas_x + 2, canvas_y + 24);
    //   // reset transparency
    //   ctx.globalAlpha = 1;
    // }
  }

  // Drawing utilities, nothing important after this point :)

  getCellColor(color) {
    if(this.x === 12 && this.y === 20) {
      color = "orange";
      return color;
    }
    switch (this.type) {
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
    return color;
  }

  drawBike(ctx, x, y) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(x + 6, y + 2, 5, 20);
  }

  drawPedestrian(ctx, x, y) {
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(x + 6, y + 2, 5, 5);
  }
}

export default Cell;