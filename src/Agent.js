class Agent {
  constructor(world, type, cell) {
    this.world = world;
    this.type = type;
    this.cell = cell;
    this.parked_cell = null;
    this.move_to = [20, 5];
    // This is for storing the calculated path
    // and not recalculating it every tick
    this.path = null;
    this.recalculatePath = true;
  }

  park() {
    if(this.cell.canPark()) {
      if(this.type === "BIKE" && this.cell.type === "PARKING" && this.parked_cell === null) {
        this.parked_cell = this.cell;
        this.type = "PEDESTRIAN";
        this.cell.addBike();
      }
    }
  }

  unpark() {
    if(this.type === "PEDESTRIAN" && this.cell.type === "PARKING" && this.parked_cell !== null) {
      this.parked_cell = null;
      this.type = "BIKE";
      this.cell.removeBike();
    }
  }

  changeMoveTo(x, y) {
    this.move_to = [x, y];
    this.recalculatePath = true;
  }

  act() {
    // If it has a goal to move to, move to it
    if(this.move_to !== null && this.recalculatePath == true) {
      this.world.bikePathfinder.findPath(this.cell.x, this.cell.y, this.move_to[0], this.move_to[1], (path) => {
        if(path !== null) {
          this.path = path;
          this.recalculatePath = false;
        } else {
          console.log("Agent has no way to reach its goal");
        }
      });
      this.world.bikePathfinder.calculate();
    } else {
      // If not, we can do other things such as looking for new goals
      // or park the pike or something
    }
  }
}

export default Agent;
