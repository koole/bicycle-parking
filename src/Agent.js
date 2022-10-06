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
    this.exitRate = 0.05; // The rate at which agents leave the building across stragegies.
    this.failedToPark = 0; // Tracks how many times the agent failed to park, used to change preferences.

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
  // CONTROL FUNCTIONS //
  ///////////////////////

  randomValueInRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  // Picks a random parking spot based on which parking lot input. Does not include MAX.
  randomSpot(location) {
    var coordinates = new Array(1);

    if (location == "north") {
      coordinates[0] = 19;
      coordinates[1] = Math.floor(Math.random() * 5);
    }
    if (location == "east") {
      coordinates[0] = Math.floor(Math.random() * 29);
      coordinates[1] = Math.floor(Math.random() * (22 - 21 + 1) + 21);
    }
    return coordinates;
  }

  ///////////////////////
  //    STRATEGIES     //
  ///////////////////////
  // 1) default: random lot, random spot.
  // 2) parkingLotPreference: specific parking lot, random spot. - yorick
  // 3) parkingLotSpotPreference: specific lot and spot. (TO DO)
  // ADD MORE!

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
          this.incoming = false;
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

  // 2) parkingLotPreference: specific parking lot, random spot. Full? Go to another lot (not in yet).
  // The cutoff point to keep searching in lot, or move to another lot (TODO)
  parkingLotPreferenceNorth() {
    switch (this.stage) {
      case "ENTERING":
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
        this.changeMoveTo(
          Math.floor(Math.random() * (29 - 20 + 1)) + 20,
          Math.floor(Math.random() * (6 - 4 + 1)) + 4,
          () => {
            this.stage = "MOVING_TO_SPOT";
          }
        );
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
          this.stage = "SEARCHING_IN_LOT";
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
          this.incoming = false;
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
        var coordinates = new Array(1);
        coordinates[0] = this.randomValueInRange(23, 29);
        coordinates[1] = this.randomValueInRange(21, 23);
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
        var x = Math.floor(Math.random() * (28 - 23 + 1) + 23);
        var y = 0;

        if (Math.random() < 0.5) {
          y = Math.floor(Math.random() * (20 - 19 + 1) + 19);
        } else {
          y = 23;
        }
        this.changeMoveTo(x, y, () => {
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
          this.stage = "SEARCHING_IN_LOT";
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
          this.incoming = false;
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
        this.changeMoveTo(16, 19, () => {
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
        var x = this.randomValueInRange(10, 17);
        var y = this.randomValueInRange(17, 19);

        this.changeMoveTo(x, y, () => {
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
          this.stage = "SEARCHING_IN_LOT";
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
          this.incoming = false;
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
        var x = this.randomValueInRange(4, 6);
        var y = this.randomValueInRange(17, 20);

        this.changeMoveTo(x, y, () => {
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
          this.stage = "SEARCHING_IN_LOT";
          this.failedToPark += 1;

          if (failedToPark > 5) {
            this.stage = "CHANGEPREF";
            this.failedToPark = 0;
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
          this.incoming = false;
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
  // 3) parkingLotSpotPreference: specific lot and spot. Full? Spread out search from spot.
  parkingLotSpotPreference() {}

  ////////////////////////
  // STRATEGY EXECUTION //
  ////////////////////////
  act() {
    this.ticks += 1;

    if (this.strategy == "DEFAULT") {
      this.default();
    } else if (this.strategy == "lotPref_NORTH") {
      this.parkingLotPreferenceNorth();
    } else if (this.strategy == "lotPref_EAST") {
      this.parkingLotPreferenceEast();
    } else if (this.strategy == "lotPref_MID") {
      this.parkingLotPreferenceMid();
    } else if (this.strategy == "lotPref_WEST") {
      this.parkingLotPreferenceWest();
    } else {
      console.log("Unknown strategy: ", this.strategy);
    }
  }
}

export default Agent;
