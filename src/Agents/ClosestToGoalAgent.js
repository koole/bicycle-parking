import Agent from "../Agent";

class ClosestToGoalAgent extends Agent {
  constructor(world, type, cell) {
    super(world, type, cell, "CLOSEST_TO_GOAL");
    this.goal = this.world.getRandomCellOfType("BUILDING_ENTRANCE");
  }

  // BFS for the closest valid parking spot
  find_closest_tile(valid_goal) {
    let coords = {};
    let Q = [];
    let grid = [];
    const label = function (x, y) {
      grid[y] ??= [];
      grid[y][x] = 1;
    };
    label(this.goal.x, this.goal.y);
    Q = [[this.goal.x, this.goal.y], ...Q];
    while (Q.length) {
      const V = Q.pop();
      const cell = this.world.getCellAtCoordinates(V[0], V[1]);
      if (valid_goal(this, cell)) {
        coords = { x: V[0], y: V[1] };
        return coords;
      }
      const dirs = [
        [V[1], V[0] + 1],
        [V[1], V[0] - 1],
        [V[1] + 1, V[0]],
        [V[1] - 1, V[0]],
      ];
      for (const [y, x] of dirs) {
        let next = this.world.state[y]?.[x];
        let valid_types = ["SPAWN", "BIKE_PATH", "ALL_PATH", "PARKING", "EXIT"];
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
    // no valid goal was found, just return current cell
    return "NO_CELL_FOUND";
  }

  act() {
    this.startAct();

    switch (this.stage) {
      case "SPAWN":
        this.visited = [{ x: this.cell.x, y: this.cell.y }];
      case "FIND_LOT":
        // find lot to move to
        const new_coords = this.find_closest_tile((agent, cell) => {
          const not_visited = agent.visited.every(
            (v_cell) =>
              Math.abs(v_cell.x - cell.x) + Math.abs(v_cell.y - cell.y) > 5
          );
          return cell.type === "PARKING" && not_visited;
        });

        if (new_coords === "NO_CELL_FOUND") {
          // if we come here, we've probably already visited every lot, so we try searching all over again
          this.stage = "SPAWN";
        } else {
          this.changeMoveTo(new_coords.x, new_coords.y, () => {
            this.visited.push(new_coords);
            this.stage = "MOVING_TO_LOT";
          });
        }
        break;

      case "MOVING_TO_LOT":
        this.executePathSequence(() => {
          this.stage = "FIND_SPOT";
        });
        break;

      case "FIND_SPOT":
        // find spot to move to
        const spot_coords = this.find_closest_tile((agent, cell) => {
          const in_lot =
            Math.abs(agent.cell.x - cell.x) + Math.abs(agent.cell.y - cell.y) <=
            5;
          return cell.canPark() && in_lot;
        });
        if (spot_coords === "NO_CELL_FOUND") {
          // There is no free spot in this lot
          this.stage = "FIND_LOT";
        } else {
          this.changeMoveTo(spot_coords.x, spot_coords.y, () => {
            this.stage = "MOVING_TO_SPOT";
          });
        }
        break;

      case "MOVING_TO_SPOT":
        this.executePathSequence(() => {
          this.stage = "PARKING";
        });
        break;

      case "PARKING":
        if (this.park()) {
          this.stage = "LEAVING_PARKING";
        } else {
          // Spot was taken before agent could park, find a new one
          this.stage = "FIND_SPOT";
        }
        break;

      default:
        this.finishedParkingStages();
        break;
    }
  }
}

export default ClosestToGoalAgent;
