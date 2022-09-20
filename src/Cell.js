class Cell {
  constructor(world, type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.agents = [];
  }

  addAgent(agent) {
    this.agents.push(agent);
    agent.cell = this;
  }

  removeAgent(agent) {
    this.agents = this.agents.filter(a => a !== agent);
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
    }

    ctx.fillStyle = color;
    ctx.fillRect(canvas_x, canvas_y, squareSize, squareSize);
    
    ctx.font = '16px serif';
    ctx.fillStyle = "black";
    ctx.fillText(this.agents.length, canvas_x, canvas_y + 20);
  }
}

export default Cell;