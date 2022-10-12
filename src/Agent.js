import { addTimeToPark, addTimeToGoal } from "./index";
import closest from "./strategies/closest";
import lotPreference from "./strategies/lotPreference";
import random from "./strategies/random";
import smart from "./strategies/smart";

class Agent {
  constructor(world, type, cell, strategy) {
    this.world = world;
    this.type = type;
    this.spawn = cell;
    this.cell = cell;
    this.parked_cell = null;
    this.strategy = strategy;
    this.move_to = null;
    this.exitRate = 0.01; // The rate at which agents leave the building across stragegies.

    // Variables for lotPreference
    this.failedToPark = 0; // Tracks how many times the agent failed to park.
    this.searchTime = 6; // How many ticks an agent is willing to search in a lot for a spot.
    // this.lotPreference = null; // Which lot is currently the preference to park for the agent.

    // SMART
    this.lots = ["north", "east", "mid", "west"];
    this.lotChoice = null;
    this.desire = null;

    // This is for storing the calculated path
    // and not recalculating it every tick
    this.path = null;
    this.calculatingPath = false;
    this.stage = "ENTERING";

    this.ticks = 0;
    this.ticks_to_parked = null;
    this.ticks_to_goal = null;
  }

  getPathfinder() {
    return this.type === "BIKE"
      ? this.world.bikePathfinder
      : this.world.pedestrianPathfinder;
  }

  hasParked() {
    this.ticks_to_parked = this.ticks;
    addTimeToPark(this.strategy, this.ticks_to_parked);
  }

  hasReachedGoal() {
    this.ticks_to_goal = this.ticks;
    addTimeToGoal(this.strategy, this.ticks_to_goal);
  }

  park(location) {
    if (this.cell.canPark()) {
      if (
        this.type === "BIKE" &&
        this.cell.type === "PARKING" &&
        this.parked_cell === null
      ) {
        this.parked_cell = this.cell;
        this.type = "PEDESTRIAN";
        this.cell.addBike();
        this.world.addLotCapacity(location);
        this.hasParked();
        return true;
      }
    }
    return false;
  }

  unpark(location) {
    if (
      this.type === "PEDESTRIAN" &&
      this.cell.type === "PARKING" &&
      this.parked_cell !== null
    ) {
      this.cell.removeBike();
      this.world.removeLotCapacity(location);
      this.parked_cell = null;
      this.type = "BIKE";
    }
  }

  changeMoveTo(x, y, callback) {
    this.calculatingPath = true;
    this.move_to = [x, y];
    this.path = null;

    const pathfinder = this.getPathfinder();
    pathfinder.findPath(
      this.cell.x,
      this.cell.y,
      this.move_to[0],
      this.move_to[1],
      (path) => {
        if (path !== null) {
          this.path = path;
        } else {
          console.log("Agent has no way to reach its goal");
        }
        this.calculatingPath = false;
        if (callback && path !== null) {
          callback();
        }
      }
    );

    pathfinder.calculate();
  }

  makeMove(nextCell) {
    if (nextCell.checkAddAgent(this)) {
      this.world.moveAgent(this, nextCell);
      this.path.shift();
    }
  }


  // FUNCTIONS:
  // Generates a random value between min and max, not including max.
  randomValueInRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  // Takes in a lot and returns x, y coordinates next to it.
  lotMove(location) {
    var coordinates = new Array(1);

    if (location == "north") {
      coordinates[0] = 19;
      coordinates[1] = this.randomValueInRange(4, 7);
    }

    if (location == "east") {
      coordinates[0] = this.randomValueInRange(23, 29);
      coordinates[1] = this.randomValueInRange(21, 23);
    }
    if (location == "mid") {
      coordinates[0] = 16;
      coordinates[1] = 19;
    }
    if (location == "west") {
      coordinates[0] = 3;
      coordinates[1] = this.randomValueInRange(17, 20);
    }

    return coordinates;
  }

  // Takes a lot to search for parking in, returns x, y coordinates of a parking spot.
  lotSearch(location) {
    var coordinates = new Array(1);

    if (location == "north") {
      coordinates[0] = this.randomValueInRange(20, 30);
      coordinates[1] = this.randomValueInRange(4, 7);
    }
    if (location == "east") {
      coordinates[0] = this.randomValueInRange(23, 29);
      if (Math.random() < 0.66) {
        coordinates[1] = this.randomValueInRange(19, 21);
      } else {
        coordinates[1] = 23;
      }
    }
    if (location == "mid") {
      coordinates[0] = this.randomValueInRange(10, 17);
      coordinates[1] = this.randomValueInRange(17, 19);
    }
    if (location == "west") {
      coordinates[0] = this.randomValueInRange(4, 6);
      coordinates[1] = this.randomValueInRange(17, 20);
    }

    return coordinates;
  }


  ////////////////////////
  // STRATEGY EXECUTION //
  ////////////////////////
  // 1) RANDOM - Random lot, random spot.
  // 2) PARKING LOT PREFERENCE - Specific lot, random spot.
  // 3) PARKING LOT/SPOT PREFERENCE - Specific lot, random spot.
  // 4) CLOSEST
  // 5) SMART - worl in progress
  // ADD MORE!
  act() {
    this.ticks += 1;
    if (this.strategy == "RANDOM_CHOICE") {
      random(this);
    } else if (this.strategy == "LOT_PREFERENCE") {
      lotPreference(this);
    } else if (this.strategy == "CLOSEST_SPOT") {
      closest(this);
    } else if (this.strategy == "SMART") {
      smart(this);
    } else {
      console.log("Unknown strategy: ", this.strategy);
    }
  }
}

export default Agent;
