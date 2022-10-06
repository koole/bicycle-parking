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
    this.failedToPark = 0; // Tracks how many times the agent failed to park, used to change preferences.
    this.searchTime = 5; // How many ticks an agent is willing to search in a lot for a spot.
    this.lotPreference = null;
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

  park() {
    if (this.cell.canPark()) {
      if (
        this.type === "BIKE" &&
        this.cell.type === "PARKING" &&
        this.parked_cell === null
      ) {
        this.parked_cell = this.cell;
        this.type = "PEDESTRIAN";
        this.cell.addBike();
        this.hasParked();
        return true;
      }
    }
    return false;
  }

  unpark() {
    if (
      this.type === "PEDESTRIAN" &&
      this.cell.type === "PARKING" &&
      this.parked_cell !== null
    ) {
      this.cell.removeBike();
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

  ///////////////////////
  //    STRATEGIES     //
  ///////////////////////
  // 1) DEFAULT - Random lot, random spot.
  // 2) PARKING LOT PREFERENCE - Specific lot, random spot.
  // 3) PARKING LOT/SPOT PREFERENCE - Specific lot, random spot.
  // ADD MORE!

  // 1) DEFAULT - Random lot, random spot.
  default() {
    switch (this.stage) {
      case "ENTERING":
        const parkingCell = this.world.getRandomCellOfType("PARKING");
        this.changeMoveTo(parkingCell.x, parkingCell.y, () => {
          this.stage = "MOVING_TO_PARKING_ENTERING";
        });
        break;
      case "MOVING_TO_PARKING_ENTERING":
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
          this.stage = "PARKING";
        }
        break;
      case "PARKING":
        if (this.park()) {
          this.stage = "LEAVING_PARKING";
        } else {
          console.log("Could not park");
          this.stage = "ENTERING";
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
        this.unpark();
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
          this.stage = "EXITED";
        }
        break;
      case "EXITED":
        this.world.removeAgent(this);
        break;
      default:
        console.log("Unknown stage: ", this.stage);
        break;
    }
  }

  // 2) PARKING LOT PREFERENCE - Agents goes to a specific lot, tried to park, after failing a few times goes to another lot.
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
      if (Math.random() < 0.5) {
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
  // PARKING LOT PREFERENCE
  parkingLotPreference() {
    switch (this.stage) {
      case "ENTERING":
        const lotOptions = ["north", "east", "mid", "west"];
        this.lotPreference =
          lotOptions[Math.floor(Math.random() * lotOptions.length)];
        if (
          this.lotPreference == "north" &&
          this.spawn.x == 35 &&
          this.spawn.y == 5
        ) {
          var coordinates = [30, this.randomValueInRange(4, 7)];
        } else {
          var coordinates = this.lotMove(this.lotPreference);
        }

        this.changeMoveTo(coordinates[0], coordinates[1], () => {
          this.stage = "MOVING_TO_LOT";
        });
        break;
      case "MOVING_TO_LOT":
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
          this.stage = "SEARCHING_IN_LOT";
        }
        break;
      case "SEARCHING_IN_LOT":
        var coordinates = this.lotSearch(this.lotPreference);
        this.changeMoveTo(coordinates[0], coordinates[1], () => {
          this.stage = "MOVING_TO_SPOT";
        });
        break;
      case "MOVING_TO_SPOT":
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
          this.stage = "PARKING";
        }
        break;
      case "PARKING":
        if (this.park()) {
          this.stage = "LEAVING_PARKING";
        } else {
          console.log("Could not park");
          this.failedToPark += 1;
          if (this.failedToPark > this.searchTime) {
            this.stage = "CHANGEPREF";
            this.failedToPark = 0;
          } else {
            this.stage = "SEARCHING_IN_LOT";
          }
        }
        break;
      case "CHANGEPREF":
        var options = ["north", "east", "mid", "west"];

        while (true) {
          var lot = options[Math.floor(Math.random() * options.length)];

          if (lot != this.lotPreference) {
            this.lotPreference = lot;
            break;
          }
        }

        var coordinates = this.lotMove(this.lotPreference);
        this.changeMoveTo(coordinates[0], coordinates[1], () => {
          this.stage = "MOVING_TO_LOT";
        });
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
        this.unpark();
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
          this.stage = "EXITED";
        }
        break;
      case "EXITED":
        this.world.removeAgent(this);
        break;
      default:
        console.log("NO STAGE");
    }
  }

  /* - OLD PREFERENCES
  parkingLotPreferenceNorth() {
    switch (this.stage) {
      case "ENTERING":
        this.lotPreference = "north";
        var coordinates = new Array(1);

        // If the agent spawns near north, check right side of the lot first.
        if (this.spawn.x == 35 && this.spawn.y == 5) {
          coordinates[0] = 30;
          coordinates[1] = this.randomValueInRange(4, 7);
        } else {
          coordinates[0] = 19;
          coordinates[1] = this.randomValueInRange(4, 7);
        }

        this.changeMoveTo(coordinates[0], coordinates[1], () => {
          this.stage = "MOVING_TO_LOT";
        });
        break;
      case "MOVING_TO_LOT":
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
          this.stage = "SEARCHING_IN_LOT";
        }
        break;

      case "SEARCHING_IN_LOT":
        var coordinates = this.lotSearch(this.lotPreference);
        this.changeMoveTo(coordinates[0], coordinates[1], () => {
          this.stage = "MOVING_TO_SPOT";
        });
        break;
      case "MOVING_TO_SPOT":
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
          this.stage = "PARKING";
        }
        break;
      case "PARKING":
        if (this.park()) {
          this.stage = "LEAVING_PARKING";
        } else {
          console.log("Could not park");
          this.failedToPark += 1;
          if (this.failedToPark > this.searchTime) {
            this.stage = "CHANGEPREF";
            this.failedToPark = 0;
          } else {
            this.stage = "SEARCHING_IN_LOT";
          }
        }
        break;
      case "CHANGEPREF":
        var options = ["north", "east", "mid", "west"];

        while (true) {
          var lot = options[Math.floor(Math.random() * options.length)];

          if (lot != this.lotPreference) {
            this.lotPreference = lot;
            break;
          }
        }

        var coordinates = this.lotMove(this.lotPreference);
        this.changeMoveTo(coordinates[0], coordinates[1], () => {
          this.stage = "MOVING_TO_LOT";
        });
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
        this.unpark();
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
          this.stage = "EXITED";
        }
        break;
      case "EXITED":
        this.world.removeAgent(this);
        break;
      default:
        console.log("NO STAGE");
    }
  }
  parkingLotPreferenceEast() {
    switch (this.stage) {
      case "ENTERING":
        this.lotPreference = "east";
        var coordinates = this.lotMove(this.lotPreference);
        this.changeMoveTo(coordinates[0], coordinates[1], () => {
          this.stage = "MOVING_TO_LOT";
        });
        break;
      case "MOVING_TO_LOT":
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
          this.stage = "SEARCHING_IN_LOT";
        }
        break;

      case "SEARCHING_IN_LOT":
        var coordinates = this.lotSearch(this.lotPreference);
        this.changeMoveTo(coordinates[0], coordinates[1], () => {
          this.stage = "MOVING_TO_SPOT";
        });
        break;

      case "MOVING_TO_SPOT":
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
          this.stage = "PARKING";
        }
        break;
      case "PARKING":
        if (this.park()) {
          this.stage = "LEAVING_PARKING";
        } else {
          console.log("Could not park");
          this.failedToPark += 1;
          if (this.failedToPark > this.searchTime) {
            this.stage = "CHANGEPREF";
            this.failedToPark = 0;
          } else {
            this.stage = "SEARCHING_IN_LOT";
          }
        }
        break;
      case "CHANGEPREF":
        var options = ["north", "east", "mid", "west"];

        while (true) {
          var lot = options[Math.floor(Math.random() * options.length)];

          if (lot != this.lotPreference) {
            this.lotPreference = lot;
            break;
          }
        }

        var coordinates = this.lotMove(this.lotPreference);
        this.changeMoveTo(coordinates[0], coordinates[1], () => {
          this.stage = "MOVING_TO_LOT";
        });
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
        this.unpark();
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
          this.stage = "EXITED";
        }
        break;
      case "EXITED":
        this.world.removeAgent(this);
        break;
      default:
        console.log("NO STAGE");
    }
  }
  parkingLotPreferenceMid() {
    switch (this.stage) {
      case "ENTERING":
        this.lotPreference = "mid";
        var coordinates = this.lotMove(this.lotPreference);
        this.changeMoveTo(coordinates[0], coordinates[1], () => {
          this.stage = "MOVING_TO_LOT";
        });
        break;
      case "MOVING_TO_LOT":
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
          this.stage = "SEARCHING_IN_LOT";
        }
        break;
      case "SEARCHING_IN_LOT":
        var coordinates = this.lotSearch(this.lotPreference);
        this.changeMoveTo(coordinates[0], coordinates[1], () => {
          this.stage = "MOVING_TO_SPOT";
        });
        break;
      case "MOVING_TO_SPOT":
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
          this.stage = "PARKING";
        }
        break;
      case "PARKING":
        if (this.park()) {
          this.stage = "LEAVING_PARKING";
        } else {
          console.log("Could not park");
          this.failedToPark += 1;
          if (this.failedToPark > this.searchTime) {
            this.stage = "CHANGEPREF";
            this.failedToPark = 0;
          } else {
            this.stage = "SEARCHING_IN_LOT";
          }
        }
        break;
      case "CHANGEPREF":
        var options = ["north", "east", "mid", "west"];

        while (true) {
          var lot = options[Math.floor(Math.random() * options.length)];

          if (lot != this.lotPreference) {
            this.lotPreference = lot;
            break;
          }
        }

        var coordinates = this.lotMove(this.lotPreference);
        this.changeMoveTo(coordinates[0], coordinates[1], () => {
          this.stage = "MOVING_TO_LOT";
        });
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
        this.unpark();
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
          this.stage = "EXITED";
        }
        break;
      case "EXITED":
        this.world.removeAgent(this);
        break;
      default:
        console.log("NO STAGE");
    }
  }
  parkingLotPreferenceWest() {
    switch (this.stage) {
      case "ENTERING":
        this.lotPreference = "west";
        var coordinates = new Array(1);
        coordinates[0] = 3;
        coordinates[1] = this.randomValueInRange(17, 20);
        this.changeMoveTo(coordinates[0], coordinates[1], () => {
          this.stage = "MOVING_TO_LOT";
        });
        break;
      case "MOVING_TO_LOT":
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
          this.stage = "SEARCHING_IN_LOT";
        }
        break;
      case "SEARCHING_IN_LOT":
        var coordinates = this.lotSearch(this.lotPreference);
        this.changeMoveTo(coordinates[0], coordinates[1], () => {
          this.stage = "MOVING_TO_SPOT";
        });
        break;
      case "MOVING_TO_SPOT":
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
          this.stage = "PARKING";
        }
        break;
      case "PARKING":
        if (this.park()) {
          this.stage = "LEAVING_PARKING";
        } else {
          console.log("Could not park");
          this.failedToPark += 1;
          if (this.failedToPark > this.searchTime) {
            this.stage = "CHANGEPREF";
            this.failedToPark = 0;
          } else {
            this.stage = "SEARCHING_IN_LOT";
          }
        }
        break;
      case "CHANGEPREF":
        var options = ["north", "east", "mid", "west"];

        while (true) {
          var lot = options[Math.floor(Math.random() * options.length)];

          if (lot != this.lotPreference) {
            this.lotPreference = lot;
            break;
          }
        }

        var coordinates = this.lotMove(this.lotPreference);
        this.changeMoveTo(coordinates[0], coordinates[1], () => {
          this.stage = "MOVING_TO_LOT";
        });
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
        this.unpark();
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
          this.stage = "EXITED";
        }
        break;
      case "EXITED":
        this.world.removeAgent(this);
        break;
      default:
        console.log("NO STAGE");
    }
  }
*/

  // 3) parkingLotSpotPreference: specific lot and spot. Full? Spread out search from spot.
  parkingLotSpotPreference() {}

  ////////////////////////
  // STRATEGY EXECUTION //
  ////////////////////////
  act() {
    this.ticks += 1;

    if (this.strategy == "DEFAULT") {
      this.default();
    } else if (this.strategy == "lotPref") {
      this.parkingLotPreference();
    } else {
      console.log("Unknown strategy: ", this.strategy);
    }
  }
}

export default Agent;
