import EasyStar from "easystarjs";

import Cell from "./Cell";

import Agent from "./Agent";
import SmartAgent from "./Agents/SmartAgent";
import RandomAgent from "./Agents/RandomAgent";
import ClosestAgent from "./Agents/ClosestAgent";

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
    this.agentsActive = []; // Agents that are currently in the world.
    this.agentsInactive = []; // Agents that are not currecntly in the world.

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

  getAgentClass(stragegy) {
    switch (stragegy) {
      case "SMART":
        return SmartAgent;
      case "RANDOM":
        return RandomAgent;
      case "CLOSEST":
        return ClosestAgent;
      default:
        return Agent;
    }
  }

  // Adds a new agent to the world, at a random spawn point
  spawnAgent(strategy) {
    // Find if there is an inactive agent with the same strategy
    const oldAgent = this.agentsInactive.find(
      (agent) => agent.strategy === strategy
    );

    // If there is an inactive agent, activate it
    if (oldAgent) {
      this.agentsActive.push(oldAgent);
      this.agentsInactive = this.agentsInactive.filter((a) => oldAgent !== a);
      oldAgent.spawn.addAgent(oldAgent);
      oldAgent.respawn();
    } else {
      // If there is no inactive agent, create a new one
      // Randomly pick a spawn cell
      const spawn = this.getRandomCellOfType("SPAWN");
      const AgentClass = this.getAgentClass(strategy);
      const newAgent = new AgentClass(this, "BIKE", spawn);
      this.agentsActive.push(newAgent);
      spawn.addAgent(newAgent);
    }
  }

  // Remove agent from world
  removeAgent(agent) {
    this.agentsActive = this.agentsActive.filter((a) => a !== agent);
    agent.cell.removeAgent(agent);
    this.agentsInactive.push(agent);
  }

  // Moves agent to a new cell
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
