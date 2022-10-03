import Cell from "./Cell";
import Agent from "./Agent";
import EasyStar from "easystarjs";

class World {
  constructor(worldmap) {
    this.state = [];
    this.agents = [];
    this.spawns = [];

    // Setup initial state
    const rows = worldmap.split("\n").filter((row) => row.length > 0);

    // Turns the characters from the worldmap into understandable strings
    const types = {
      // Useful stuff
      S: "SPAWN",
      X: "BUILDING_ENTRANCE",
      b: "BIKE_PATH",
      w: "PEDESTRIAN_PATH",
      a: "ALL_PATH",
      p: "PARKING",
      // Cosmetics
      e: "EMPTY",
      o: "BUILDING",
    };

    // Create cells
    // Loop over the 2D array of types, and create a new cell for each type
    for (const [y, row] of rows.entries()) {
      const rowData = [...row].map((c, x) => {
        const type = types[c];
        const cell = new Cell(this, type, x, y);

        if (type === "SPAWN") {
          this.spawns.push(cell);
        }

        return cell;
      });
      this.state.push(rowData);
    }

    this.bikePathfinder = new EasyStar.js();
    this.pedestrianPathfinder = new EasyStar.js();

    this.bikePathfinder.setGrid(
      this.state.map((row) =>
        row.map((cell) =>
          ["SPAWN", "BIKE_PATH", "ALL_PATH", "PARKING"].includes(cell.type)
            ? 1
            : 0
        )
      )
    );
    this.bikePathfinder.setAcceptableTiles([1]);

    this.pedestrianPathfinder.setGrid(
      this.state.map((row) =>
        row.map((cell) =>
          [
            "PEDESTRIAN_PATH",
            "ALL_PATH",
            "PARKING",
            "BUILDING_ENTRANCE",
          ].includes(cell.type)
            ? 1
            : 0
        )
      )
    );
    this.pedestrianPathfinder.setAcceptableTiles([1]);
  }

  getCellAtCoordinates(x, y) {
    return this.state[y][x];
  }

  getRandomCellOfType(type) {
    const cells = this.state.flat().filter((cell) => cell.type === type);
    return cells[Math.floor(Math.random() * cells.length)];
  }

  // // Returns all neighbors of a cell
  // getNeighbors(cell) {
  //   const { x, y } = cell;
  //   let neighbors = [];

  //   // Get neighbors in all 4 directions
  //   if (y > 0) {
  //     neighbors.push(this.state[y - 1][x]);
  //   }
  //   if (y < this.state.length - 1) {
  //     neighbors.push(this.state[y + 1][x]);
  //   }
  //   if (x > 0) {
  //     neighbors.push(this.state[y][x - 1]);
  //   }
  //   if (x < this.state[y].length - 1) {
  //     neighbors.push(this.state[y][x + 1]);
  //   }
  //   return neighbors;
  // }

  // Adds a new agent to the world, at a random spawn point
  spawnAgent(strategy) {
    // Randomly pick a spawn cell
    const spawn = this.spawns[Math.floor(Math.random() * this.spawns.length)];
    const agent = new Agent(this, "BIKE", spawn, strategy);

    if (spawn.checkAddAgent(agent)) {
      // Add agent of type "BIKE" to this cell
      spawn.addAgent(agent);
      this.agents.push(agent);
    }
  }

  // Remove agent
  removeAgent(agent) {
    this.agents = this.agents.filter((a) => a !== agent);
    agent.cell.removeAgent(agent);
  }

  // // Moves agent to a new cell
  moveAgent(agent, cell) {
    if (cell.checkAddAgent(agent)) {
      agent.cell.removeAgent(agent);
      cell.addAgent(agent);
      agent.cell = cell;
    }
  }

  tick() {
    this.agents.sort(function () {
      return 0.5 - Math.random();
    });
    for (const agent of this.agents) {
      agent.act();
    }
  }
}

export default World;
