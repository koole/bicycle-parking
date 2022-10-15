import Agent from "../Agent";

class RandomAgent extends Agent {
  constructor(world, type, cell) {
    super(world, type, cell, "RANDOM");
  }

  act() {
    this.startAct();

    switch (this.stage) {
      case "SPAWN":
        const parkingCell = this.world.getRandomCellOfType("PARKING");
        this.changeMoveTo(parkingCell.x, parkingCell.y, () => {
          this.stage = "MOVING_TO_PARKING_ENTERING";
        });
        break;
      case "MOVING_TO_PARKING_ENTERING":
        this.executePathSequence(() => {
          this.stage = "PARKING";
        });
        break;
      case "PARKING":
        if (this.park()) {
          this.stage = "LEAVING_PARKING";
        } else {
          this.stage = "ENTERING";
        }
        break;
      default:
        this.finishedParkingStages();
        break;
    }
  }
}

export default RandomAgent;
