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
    addTimeToPark(this.ticks_to_parked);
  }

  hasReachedGoal() {
    this.ticks_to_goal = this.ticks;
    addTimeToGoal(this.ticks_to_goal);
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

  // WORK ON AGENT STRATS HERE -->
  act() {
    this.ticks += 1;
    switch (this.strategy) {
      case "TEST_STRATEGY":
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
            }
            break;
          case "LEAVING_PARKING":
            const buildingCell = this.world.getRandomCellOfType("BUILDING_ENTRANCE");
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
            // Todo: Wait for a bit
            this.stage = "LEAVING_GOAL";
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
        break;
      default:
        console.log("Unknown strategy: ", this.strategy);
    }
  }
}

export default Agent;
