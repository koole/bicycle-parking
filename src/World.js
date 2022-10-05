import Cell from "./Cell";
import Agent from "./Agent";
import EasyStar from "easystarjs";

function getDirectionArray(direction) {
  switch (direction) {
    case "n":
      return [EasyStar.BOTTOM];
    case "s":
      return [EasyStar.TOP];
    case "e":
      return [EasyStar.LEFT];
    case "w":
      return [EasyStar.RIGHT];
    case "v":
      return [EasyStar.TOP, EasyStar.BOTTOM];
    case "h":
      return [EasyStar.LEFT, EasyStar.RIGHT];
    default:
      return [EasyStar.TOP, EasyStar.BOTTOM, EasyStar.LEFT, EasyStar.RIGHT];
  }
}

class World {
  constructor(worldmap, mapDirection, selectedStrategies) {
    this.state = [];
    this.agents = [];

    // Setup initial state
    const rows = worldmap.split("\n").filter((row) => row.length > 0);
    const directionRows = mapDirection.split("\n").filter((row) => row.length > 0);

    // Turns the characters from the worldmap into understandable strings
    const types = {
      // Useful stuff
      S: "SPAWN",
      E: "EXIT",
      X: "BUILDING_ENTRANCE",
      b: "BIKE_PATH",
      w: "PEDESTRIAN_PATH",
      a: "ALL_PATH",
      p: "PARKING",
      // Cosmetics
      _: "EMPTY",
      o: "BUILDING",
    };

    this.bikePathfinder = new EasyStar.js();
    this.pedestrianPathfinder = new EasyStar.js();

    // Create cells
    // Loop over the 2D array of types, and create a new cell for each type
    for (const [y, row] of rows.entries()) {
      const directionRow = [...directionRows[y]];
      const rowData = [...row].map((c, x) => {
        const allowed_direction = directionRow[x];
        const type = types[c];
        const cell = new Cell(this, type, x, y, allowed_direction);

        this.bikePathfinder.setDirectionalCondition(x, y, getDirectionArray(allowed_direction));
        this.pedestrianPathfinder.setDirectionalCondition(x, y, getDirectionArray(allowed_direction));

        return cell;
      });
      this.state.push(rowData);
    }

    this.bikePathfinder.setGrid(
      this.state.map((row) => row.map((cell) => cell.type))
    );
    this.bikePathfinder.setAcceptableTiles([
      "SPAWN",
      "BIKE_PATH",
      "ALL_PATH",
      "PARKING",
      "EXIT",
    ]);
    this.bikePathfinder.setTileCost("ALL_PATH", 2);
    this.bikePathfinder.setTileCost("PARKING", 4);

    this.pedestrianPathfinder.setGrid(
      this.state.map((row) => row.map((cell) => cell.type))
    );
    this.pedestrianPathfinder.setAcceptableTiles([
      "PEDESTRIAN_PATH",
      "ALL_PATH",
      "PARKING",
      "BUILDING_ENTRANCE",
    ]);
    this.pedestrianPathfinder.setTileCost("ALL_PATH", 2);
    this.pedestrianPathfinder.setTileCost("PARKING", 3);
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
    const spawn = this.getRandomCellOfType("SPAWN");
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
