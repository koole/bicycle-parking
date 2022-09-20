import Cell from "./Cell";
import Agent from "./Agent"

class World {
  constructor(worldmap) {
    this.state = [];
    this.agents = [];
    this.spawns = [];

    // Setup initial state
    const rows = worldmap.split("\n");

    const types = {
      // Useful stuff
      s: "SPAWN",
      b: "BIKE_PATH",
      w: "PEDESTRIAN_PATH",
      a: "ALL_PATH",
      p: "PARKING",
      // Cosmetics
      e: "EMPTY",
      u: "BUILDING"
    }

    for (const [y, row] of rows.entries()) {
      const rowData = [...row].map((c, x) => {
        const type = types[c];
        const cell = new Cell(this, type, x, y);

        if(type === "SPAWN") {
          this.spawns.push(cell);
        }

        return cell;
      });
      this.state.push(rowData);
    }
  }  

  getNeighbors(cell) {
    const { x, y } = cell;
    let neighbors = [];
    console.log(this.state)
    // Get neighbors in all 4 directions
    if (y > 0) {
      neighbors.push(this.state[y - 1][x]);
    }
    if (y < this.state.length - 1) {
      neighbors.push(this.state[y + 1][x]);
    }
    if (x > 0) {
      neighbors.push(this.state[y][x - 1]);
    }
    if (x < this.state[y].length - 1) {
      neighbors.push(this.state[y][x + 1]);
    }
    // Ignore neighbors that this type of cell is not allowed to visit
    neighbors = neighbors.filter(neighbor => {
      switch(cell.type) {
        case "SPAWN":
          return true;
        case "BIKE_PATH":
          return neighbor.type === "BIKE_PATH" || neighbor.type === "ALL_PATH";
        case "PEDESTRIAN_PATH":
          return neighbor.type === "PEDESTRIAN_PATH" || neighbor.type === "ALL_PATH";
        case "ALL_PATH":
          return true;
        case "PARKING":
          return true;
        case "EMPTY":
          return false;
        case "BUILDING":
          return false;
        default:
          return false;
      }
    });
    return neighbors;
  }

  spawnAgent() {
    const spawn = this.spawns[Math.floor(Math.random() * this.spawns.length)];

    const agent = new Agent(this, "BIKE", spawn);
    this.agents.push(agent);
    spawn.addAgent(agent);
  }

  tick() {
    for(const agent of this.agents) {
      const cell = agent.cell;
      const neighbors = this.getNeighbors(cell);
      console.log(neighbors)
    } 
  }
}

export default World;
