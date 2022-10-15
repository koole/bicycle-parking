import Agent from "../Agent";

class ClosestAgent extends Agent {
  constructor(world, type, cell) {
    super(world, type, cell, "CLOSEST");
  }

  act() {
    this.startAct();

    switch (this.stage) {
      case "SPAWN":
        // BFS for the closest valid parking spot
        let coords = { x: 0, y: 0 };
        let Q = [];
        let grid = [];
        const label = function (x, y) {
          grid[y] ??= [];
          grid[y][x] = 1;
        };
        label(this.cell.x, this.cell.y);
        Q = [[this.cell.x, this.cell.y], ...Q];
        BFS: while (Q.length) {
          const V = Q.pop();
          const cell = this.world.getCellAtCoordinates(V[0], V[1]);
          if (cell.canPark()) {
            coords = { x: V[0], y: V[1] };
            break BFS;
          }
          const dirs = [
            [V[1], V[0] + 1],
            [V[1], V[0] - 1],
            [V[1] + 1, V[0]],
            [V[1] - 1, V[0]],
          ];
          for (const [y, x] of dirs) {
            let next = this.world.state[y]?.[x];
            let valid_types = [
              "SPAWN",
              "BIKE_PATH",
              "ALL_PATH",
              "PARKING",
              "EXIT",
            ];
            if (
              next !== undefined &&
              valid_types.includes(next.type) &&
              grid[y]?.[x] !== 1
            ) {
              label(x, y);
              Q = [[x, y], ...Q];
            }
          }
        }
        this.changeMoveTo(coords.x, coords.y, () => {
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
          this.stage = "SPAWN";
        }
        break;

      default:
        this.finishedParkingStages();
        break;
    }
  }
}

export default ClosestAgent;
