import Agent from "../Agent";

class RandomAgent extends Agent {
  constructor(world, type, cell) {
    super(world, type, cell, "RANDOM");
  }

  act() {
    this.startAct();

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
          // console.warn("Could not park");
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