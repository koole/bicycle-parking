class Agent {
  constructor(world, type, cell, strategy) {
    this.world = world;
    this.type = type;
    this.cell = cell;
    this.parked_cell = null;
    this.move_to = [23, 5];
    // This is for storing the calculated path
    // and not recalculating it every tick
    this.path = null;
    this.recalculatePath = true;
    this.strategy = strategy;
  }

  getPathfinder() {
    return this.type === "BIKE" ? this.world.bikePathfinder : this.world.pedestrianPathfinder;
  }

  park() {
    if (this.cell.canPark()) {
      if (this.type === "BIKE" && this.cell.type === "PARKING" && this.parked_cell === null) {
        this.parked_cell = this.cell;
        this.type = "PEDESTRIAN";
        this.cell.addBike();
      }
    }
  }

  unpark() {
    if (this.type === "PEDESTRIAN" && this.cell.type === "PARKING" && this.parked_cell !== null) {
      this.parked_cell = null;
      this.type = "BIKE";
      this.cell.removeBike();
    }
  }

  changeMoveTo(x, y) {
    this.move_to = [x, y];
    this.path = null;
    this.recalculatePath = true;
  }

  act() {

    switch (this.strategy) {
      case "TEST_STRATEGY":
        // Temporary: If possible, just randomly decide to park bike
        if (this.type === "BIKE" && this.cell.type === "PARKING" && Math.random() < 0.1) {
          this.park();
          this.move_to = null;
        }

        // If it has a goal to move to, and route needs to be calculated
        // calculate route and then move.
        if (this.move_to !== null && this.recalculatePath == true) {
          const pathfinder = this.getPathfinder();
          pathfinder.findPath(this.cell.x, this.cell.y, this.move_to[0], this.move_to[1], (path) => {
            if (path !== null) {
              this.path = path;
              this.recalculatePath = false;
            } else {
              console.log("Agent has no way to reach its goal");
            }
          });
          pathfinder.calculate();
          // If route is already calculated, just move to the next cell
        } else if (this.move_to !== null && this.path !== null && this.path.length > 0) {
          const nextCell = this.world.getCellAtCoordinates(this.path[0].x, this.path[0].y);
          if (nextCell.checkAddAgent(this)) {
            this.world.moveAgent(this, nextCell);
            this.path.shift();
          }
          if (this.path.length === 0) {
            this.move_to = null;
            this.recalculatePath = true;
          }
          // Path is empty, so we are next to goal. Move into ti.
        } else {
          // If not, we can do other things such as looking for new goals
          // or park the pike or something

          // Temporary: If no goal and agent is now pedestrian, the agent must have
          // just parked their bike. So we set a next goal: the entrance.
          if (this.type === "PEDESTRIAN") {
            this.changeMoveTo(12, 20);
          }
        }
        break;
      default:
        console.log("Unknown strategy: ", this.strategy);
    }
  }
}

export default Agent;
