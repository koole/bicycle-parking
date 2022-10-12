const MAX_PARKED_BIKES = 4;

class Cell {
  constructor(world, type, x, y, allowed_direction) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.agents = [];
    this.bikes = 0;
    this.allowed_direction = allowed_direction;
  }

  // Check if agent can be added to this cell
  checkAddAgent(agent) {
    if (this.type === "SPAWN") {
      return true;
    }

    if (this.type === "BUILDING_ENTRANCE" && agent.type === "PEDESTRIAN") {
      return true;
    }
    // Allow a maximum of:
    // 2 agents of type BIKE
    // or 3 agents of type PEDESTRIAN
    // or 1 agent of type BIKE and 2 agents of type PEDESTRIAN
    // or 2 agent of type BIKE and 1 agents of type PEDESTRIAN
    if (
      agent.type === "BIKE" &&
      this.agents.filter(({ type }) => type === "BIKE").length >= 20
    ) {
      return false;
    }
    if (
      agent.type === "PEDESTRIAN" &&
      this.agents.filter(({ type }) => type === "PEDESTRIAN").length >= 30
    ) {
      return false;
    }
    if (
      agent.type === "BIKE" &&
      this.agents.filter(({ type }) => type === "PEDESTRIAN").length >= 20
    ) {
      return false;
    }
    if (
      agent.type === "PEDESTRIAN" &&
      this.agents.filter(({ type }) => type === "BIKE").length >= 30
    ) {
      return false;
    }
    return true;
  }

  addAgent(agent) {
    this.agents.push(agent);
  }

  removeAgent(agent) {
    this.agents = this.agents.filter((a) => a !== agent);
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

  draw(ctx, x, y, squareSize, drawDirection, drawCoords, drawCount) {
    const canvas_x = x * squareSize;
    const canvas_y = y * squareSize;

    let color = "#fefefe";

    color = this.getCellColor(color);

    ctx.fillStyle = color;
    ctx.fillRect(canvas_x, canvas_y, squareSize, squareSize);

    // !! Draws directions in which agents are allowed to move
    if (drawDirection) {
      ctx.font = "16px monospace";
      ctx.fillStyle = "#ffffff";
      // make text slightly transparent
      ctx.globalAlpha = 0.8;
      let arrow = "";
      if (this.allowed_direction === "n") {
        arrow = "↑";
      } else if (this.allowed_direction === "s") {
        arrow = "↓";
      } else if (this.allowed_direction === "e") {
        arrow = "→";
      } else if (this.allowed_direction === "w") {
        arrow = "←";
      } else if (this.allowed_direction === "h") {
        arrow = "↔";
      } else if (this.allowed_direction === "v") {
        arrow = "↕";
      }
      ctx.fillText(arrow, canvas_x + 11, canvas_y + 20);
      // reset transparency
      ctx.globalAlpha = 1;
    }

    // Draw progress bar for amount of parked bikes
    if (this.type === "PARKING") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(canvas_x + 2, canvas_y + squareSize - 8, squareSize - 4, 4);

      if (this.bikes == MAX_PARKED_BIKES) {
        ctx.fillStyle = "#dc3545";
      } else {
        ctx.fillStyle = "#316cf4";
      }
      ctx.fillRect(
        canvas_x + 2,
        canvas_y + squareSize - 8,
        (squareSize + 4) * (this.bikes / MAX_PARKED_BIKES),
        4
      );
    }

    if (this.type === "BUILDING_ENTRANCE") {
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px monospace";
      ctx.fillText(
        "" +
          String(
            this.agents.filter(({ type }) => type === "PEDESTRIAN").length
          ).padStart(3, "0"),
        canvas_x + 1.5,
        canvas_y + 21
      );
    } else {
      const bikeAgents = this.agents.filter(({ type }) => type === "BIKE");
      const pedestrianAgents = this.agents.filter(
        ({ type }) => type === "PEDESTRIAN"
      );
      if (bikeAgents.length > 0) {
        bikeAgents.forEach((agent, i) => {
          // If the current agents is moving to the left or right in the agent's paths next step
          // then draw the bike in the horizontal position
          if (
            agent.path &&
            agent.path.length > 0 &&
            agent.path[0].x === agent.cell.x
          ) {
            this.drawBike(ctx, x * squareSize, y * squareSize, "vertical", i);
          } else {
            this.drawBike(ctx, x * squareSize, y * squareSize, "horizontal", i);
          }
        });
        if (pedestrianAgents.length > 0) {
          pedestrianAgents.forEach((agent, i) => {
            this.drawPedestrian(
              ctx,
              x * squareSize + 10,
              y * squareSize + i * 10
            );
          });
        }
      } else if (pedestrianAgents.length > 0) {
        pedestrianAgents.forEach((agent, i) => {
          if (i < 2) {
            this.drawPedestrian(ctx, x * squareSize + i * 10, y * squareSize);
          } else {
            this.drawPedestrian(ctx, x * squareSize + 5, y * squareSize + 10);
          }
        });
      }
    }

    //!! Debug to show number of agents in cell
    if (
      drawCount &&
      [
        "SPAWN",
        "BIKE_PATH",
        "PEDESTRIAN_PATH",
        "ALL_PATH",
        "PARKING",
        "BUILDING_ENTRANCE",
      ].includes(this.type)
    ) {
      ctx.font = "12px monospace";
      ctx.fillStyle = "black";
      ctx.globalAlpha = 0.3;
      ctx.fillText(
        "B:" + this.agents.filter(({ type }) => type === "BIKE").length,
        canvas_x + 2,
        canvas_y + 12
      );
      ctx.fillText(
        "P:" + this.agents.filter(({ type }) => type === "PEDESTRIAN").length,
        canvas_x + 2,
        canvas_y + 24
      );
      ctx.globalAlpha = 1;
    }

    // !! Draw coordinates
    if (drawCoords) {
      ctx.font = "11px monospace";
      ctx.fillStyle = "black";
      ctx.globalAlpha = 0.5;
      ctx.fillText(this.x + ",", canvas_x, canvas_y + 10);
      ctx.fillText(this.y, canvas_x, canvas_y + 22);
      ctx.globalAlpha = 1;
    }
  }

  // Drawing utilities, nothing important after this point :)

  getCellColor(color) {
    switch (this.type) {
      case "SPAWN":
        color = "#e7b1b6";
        break;
      case "BIKE_PATH":
        color = "#f3d8da";
        break;
      case "PEDESTRIAN_PATH":
        color = "#eaecef";
        break;
      case "ALL_PATH":
        color = "#cfd4d9";
        break;
      case "PARKING":
        color = "#aeb5bc";
        break;
      case "EMPTY":
        color = "#d5e6de";
        break;
      case "BUILDING":
        color = "#a6c4f9";
        break;
      case "BUILDING_ENTRANCE":
        color = "#7ba6f7";
        break;
      case "EXIT":
        color = "#e7b1b6";
        break;
    }
    return color;
  }

  drawBike(ctx, x, y, orientation, i) {
    ctx.fillStyle = "#222529";
    if (orientation === "vertical") {
      ctx.fillRect(x + 6 + 10 * i, y + 2, 5, 20);
    } else {
      ctx.fillRect(x + 2, y + 6 + 10 * i, 20, 5);
    }
  }

  drawPedestrian(ctx, x, y) {
    ctx.fillStyle = "#fd7e14";
    ctx.fillRect(x + 6, y + 2, 5, 5);
  }
}

export default Cell;
