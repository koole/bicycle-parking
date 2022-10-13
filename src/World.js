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
    this.agentsMax = 250; // Max unique agents that can be present.
    this.spawnPotential = 0; // Keeps track of how many new agents have been added. Caps at agentsMax.
    this.agentsActive = []; // Agents that are currently in the world.
    this.agentsDeactive = []; // Agents that are not currecntly in the world.

    // This keeps track how full the lots are.
    this.northCapacity = 0;
    this.eastCapacity = 0;
    this.midCapacity = 0;
    this.westCapacity = 0;

    this.tickCount = 0;

    // Setup initial state
    const rows = worldmap.split("\n").filter((row) => row.length > 0);
    const directionRows = mapDirection
      .split("\n")
      .filter((row) => row.length > 0);

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

        this.bikePathfinder.setDirectionalCondition(
          x,
          y,
          getDirectionArray(allowed_direction)
        );
        this.pedestrianPathfinder.setDirectionalCondition(
          x,
          y,
          getDirectionArray(allowed_direction)
        );

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

  getParkingLots() {
    return this.state.flat().filter((cell) => cell.type === "PARKING");
  }

  // These capacity functions evaulate the amount of bikes park in lots.
  addLotCapacity(location) {
    if (location == "north") {
      this.northCapacity += 1;
    }
    if (location == "east") {
      this.eastCapacity += 1;
    }
    if (location == "mid") {
      this.midCapacity += 1;
    }
    if (location == "west") {
      this.westCapacity += 1;
    }
  }

  removeLotCapacity(location) {
    if (location == "north") {
      this.northCapacity -= 1;
    }
    if (location == "east") {
      this.eastCapacity -= 1;
    }
    if (location == "mid") {
      this.midCapacity -= 1;
    }
    if (location == "west") {
      this.westCapacity -= 1;
    }
  }

  getLotCapacity(location) {
    if (location == "north") {
      return this.northCapacity / 120;
    }
    if (location == "east") {
      return this.eastCapacity / 72;
    }
    if (location == "mid") {
      return this.midCapacity / 56;
    }
    if (location == "west") {
      return this.westCapacity / 24;
    }
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
    if (this.spawnPotential < this.agentsMax) {
      const agent = new Agent(this, "BIKE", spawn, strategy);

      if (spawn.checkAddAgent(agent)) {
        spawn.addAgent(agent);
        this.agentsActive.push(agent);
        this.spawnPotential += 1;
      }
    } else if (this.agentsDeactive.length > 0) {
      const agent = this.agentsDeactive.shift();

      // Realign the agent to the correct spawn cell.
      agent.spawn = spawn;
      agent.cell = spawn;

      if (agent.spawn.checkAddAgent(agent)) {
        agent.spawn.addAgent(agent);

        this.agentsActive.push(agent);
      }
    } else {
      //Do nothing
    }
  }

  // Remove agent from world?
  removeAgent(agent) {
    this.agentsActive = this.agentsActive.filter((a) => a !== agent);
    agent.cell.removeAgent(agent);
    this.agentsDeactive.push(agent);
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
    this.tickCount++;
    this.agentsActive.sort(function () {
      return 0.5 - Math.random();
    });
    for (const agent of this.agentsActive) {
      if (agent.type === "BIKE") {
        agent.act();
      } else if (agent.type === "PEDESTRIAN" && this.tickCount % 2 === 0) {
        agent.act();
      }
    }
  }
}

export default World;
