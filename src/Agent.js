import { addTimeToPark, addTimeToGoal } from "./index";

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

    // This is for storing the calculated path
    // and not recalculating it every tick
    this.path = null;
    this.calculatingPath = false;
    this.stage = "SPAWN";

    this.ticks = 0;
    this.ticks_to_parked = null;
    this.ticks_to_goal = null;

    ///////////////
    //// SMART ////
    ///////////////

    // Variables relating to lot preferences.
    this.lots = ["north", "east", "mid", "west"];
    this.lotChoice = null;
    // NORTH, EAST, MID, WEST
    this.lotPreference = [
      Math.random(),
      Math.random(),
      Math.random(),
      Math.random(),
    ];
    this.changePreference = 0.01; // The amount preference changes upon update.

    // Variables for searching in lot.
    this.searchPath = [];
    this.searchTime = 6;
    this.searchFail = 0;
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

  ////////////////////////
  // STRATEGY EXECUTION //
  ////////////////////////

  // AUXILIARY FUNCTIONS //
  randomValueInRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  randomLotCoordinates(location) {
    // Returns random parking coordinates at the given location.
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

  lotSearch() {
    var coordinates = new Array(1);

    if (this.world.state[this.cell.y][this.cell.x + 1].type == "PARKING") {
      coordinates[0] = this.cell.x + 1;
      coordinates[1] = this.cell.y;
    } else if (
      this.world.state[this.cell.y][this.cell.x - 1].type == "PARKING"
    ) {
      coordinates[0] = this.cell.x - 1;
      coordinates[1] = this.cell.y;
    } else if (
      this.world.state[this.cell.y - 1][this.cell.x].type == "PARKING"
    ) {
      coordinates[0] = this.cell.x;
      coordinates[1] = this.cell.y - 1;
    } else if (
      this.world.state[this.cell.y + 1][this.cell.x].type == "PARKING"
    ) {
      coordinates[0] = this.cell.x;
      coordinates[1] = this.cell.y - 1;
    } else {
      this.searchPath.pop(coordinates);
      return coordinates;
    }

    this.searchPath.push(coordinates);
    return coordinates;
  }

  checkPreference() {
    var maxPref = Math.max(...this.lotPreference);
    var index = this.lotPreference.indexOf(maxPref);

    console.log("PREF:", this.lots[index], "LVL:", maxPref);

    return this.lots[index];
  }

  // Basically the update function for the agents.
  increasePreference(location) {
    var index = this.lots.indexOf(location);

    for (let i = 0; i < this.lots.length; i++) {
      if (i == index) {
        this.lotPreference[i] += this.changePreference;
      } else {
        this.lotPreference[i] -= this.changePreference;
      }

      this.lotPreference[i] = Math.round(this.lotPreference[i] * 100.0) / 100.0;

      this.lotPreference[i] =
        this.lotPreference[i] > 1
          ? (this.lotPreference[i] = 1)
          : this.lotPreference[i];

      this.lotPreference[i] =
        this.lotPreference[i] < 0
          ? (this.lotPreference[i] = 0)
          : this.lotPreference[i];
    }
  }

  decreasePreference(location) {
    var index = this.lots.indexOf(location);

    for (let i = 0; i < this.lots.length; i++) {
      if (i == index) {
        this.lotPreference[i] -= this.changePreference;
      } else {
        this.lotPreference[i] += this.changePreference;
      }

      this.lotPreference[i] = Math.round(this.lotPreference[i] * 100.0) / 100.0;

      this.lotPreference[i] =
        this.lotPreference[i] > 1
          ? (this.lotPreference[i] = 1)
          : this.lotPreference[i];

      this.lotPreference[i] =
        this.lotPreference[i] < 0
          ? (this.lotPreference[i] = 0)
          : this.lotPreference[i];
    }
  }

  // SMART STRATEGY //
  act() {
    this.ticks += 1;

    switch (this.stage) {
      case "SPAWN":
        this.lotChoice = this.checkPreference();
        var coordinates = this.randomLotCoordinates(this.lotChoice);

        this.changeMoveTo(coordinates[0], coordinates[1], () => {
          this.stage = "MOVE_TO_LOT";
        });
        break;
      case "CHANGE_CHOICE":
        this.decreasePreference(this.lotChoice);

        while (true) {
          var choice = this.lots[Math.floor(Math.random() * this.lots.length)];

          if (choice != this.lotChoice) {
            this.lotChoice = choice;
            break;
          }
        }

        var coordinates = this.randomLotCoordinates(this.lotChoice);
        this.changeMoveTo(coordinates[0], coordinates[1], () => {
          this.stage = "MOVE_TO_LOT";
        });
        break;

      case "MOVE_TO_LOT":
        if (
          this.calculatingPath == false &&
          this.path !== null &&
          this.path.length > 0
        ) {
          const nextCell = this.world.getCellAtCoordinates(
            this.path[0].x,
            this.path[0].y
          );
          this.makeMove(nextCell);

          if (this.path.length < 5) {
            this.stage = "EVALUATE_LOT";
          }
        } else {
          this.stage = "PARKING";
        }
        break;
      case "EVALUATE_LOT":
        if (this.world.getLotCapacity(this.lotChoice) > 0.8) {
          this.stage = "CHANGE_CHOICE";
        } else {
          this.stage = "MOVE_TO_LOT";
        }
        break;
      case "SEARCHING_IN_LOT":
        var coordinates = this.lotSearch();
        this.changeMoveTo(coordinates[0], coordinates[1], () => {
          this.stage = "MOVE_TO_LOT";
        });
        break;
      case "PARKING":
        if (this.park(this.lotChoice)) {
          this.stage = "LEAVING_PARKING";
          this.increasePreference(this.lotChoice);
        } else {
          // console.warn("Could not park");
          this.searchFail += 1;
          if (this.searchFail > this.searchTime) {
            this.stage = "CHANGE_CHOICE";
            this.searchFail = 0;
          } else {
            this.stage = "SEARCHING_IN_LOT";
          }
        }
        break;
      case "LEAVING_PARKING":
        const buildingCell =
          this.world.getRandomCellOfType("BUILDING_ENTRANCE");
        this.changeMoveTo(buildingCell.x, buildingCell.y, () => {
          this.stage = "MOVING_TO_GOAL";
        });
        break;
      case "MOVING_TO_GOAL":
        if (
          this.calculatingPath == false &&
          this.path !== null &&
          this.path.length > 0
        ) {
          const nextCell = this.world.getCellAtCoordinates(
            this.path[0].x,
            this.path[0].y
          );
          this.makeMove(nextCell);
        } else {
          this.stage = "IN_GOAL";
          this.hasReachedGoal();
        }
        break;
      case "IN_GOAL":
        if (Math.random() < this.exitRate) {
          this.stage = "LEAVING_GOAL";
        }
        break;
      case "LEAVING_GOAL":
        this.changeMoveTo(this.parked_cell.x, this.parked_cell.y, () => {
          this.stage = "MOVING_TO_PARKING_LEAVING";
        });
        break;
      case "MOVING_TO_PARKING_LEAVING":
        if (
          this.calculatingPath == false &&
          this.path !== null &&
          this.path.length > 0
        ) {
          const nextCell = this.world.getCellAtCoordinates(
            this.path[0].x,
            this.path[0].y
          );
          this.makeMove(nextCell);
        } else {
          this.stage = "UNPARKING";
        }
        break;
      case "UNPARKING":
        this.unpark(this.lotChoice);
        this.stage = "LEAVING";
        break;
      case "LEAVING":
        this.changeMoveTo(this.spawn.x, this.spawn.y, () => {
          this.stage = "MOVING_TO_EXIT";
        });
        break;
      case "MOVING_TO_EXIT":
        if (
          this.calculatingPath == false &&
          this.path !== null &&
          this.path.length > 0
        ) {
          const nextCell = this.world.getCellAtCoordinates(
            this.path[0].x,
            this.path[0].y
          );
          this.makeMove(nextCell);
        } else {
          this.stage = "DESPAWN";
        }
        break;
      case "DESPAWN":
        this.stage = "SPAWN";
        this.world.removeAgent(this);
        break;
      default:
        console.log("Unknown stage: ", this.stage);
        break;
    }
  }
}

export default Agent;
