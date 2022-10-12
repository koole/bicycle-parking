export default function closest(agent) {
    switch (agent.stage) {
      case "ENTERING":
        // BFS for the closest valid parking spot
        let coords = { x: 0, y: 0 };
        let Q = [];
        let grid = [];
        const label = function (x, y) {
          grid[y] ??= [];
          grid[y][x] = 1;
        };
        label(agent.cell.x, agent.cell.y);
        Q = [[agent.cell.x, agent.cell.y], ...Q];
        BFS: while (Q.length) {
          const V = Q.pop();
          const cell = agent.world.getCellAtCoordinates(V[0], V[1]);
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
            let next = agent.world.state[y]?.[x];
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
        agent.changeMoveTo(coords.x, coords.y, () => {
          agent.stage = "MOVING_TO_PARKING_ENTERING";
        });
        break;
      case "PARKING":
        if (agent.park()) {
          agent.stage = "LEAVING_PARKING";
        } else {
          agent.stage = "ENTERING";
        }
        break;
      // cases below are copied from default
      case "MOVING_TO_PARKING_ENTERING":
        if (
          agent.calculatingPath == false &&
          agent.path !== null &&
          agent.path.length > 0
        ) {
          const nextCell = agent.world.getCellAtCoordinates(
            agent.path[0].x,
            agent.path[0].y
          );
          agent.makeMove(nextCell);
        } else {
          agent.stage = "PARKING";
        }
        break;
      case "CHANGEPREF":
        var options = ["north", "east", "mid", "west"];

        while (true) {
          var lot = options[Math.floor(Math.random() * options.length)];

          if (lot != agent.lotPreference) {
            agent.lotPreference = lot;
            break;
          }
        }

        var coordinates = agent.lotMove(agent.lotPreference);
        agent.changeMoveTo(coordinates[0], coordinates[1], () => {
          agent.stage = "MOVING_TO_LOT";
        });
        break;
      case "LEAVING_PARKING":
        const buildingCell =
          agent.world.getRandomCellOfType("BUILDING_ENTRANCE");
        agent.changeMoveTo(buildingCell.x, buildingCell.y, () => {
          agent.stage = "MOVING_TO_GOAL";
        });
        break;
      case "MOVING_TO_GOAL":
        if (
          agent.calculatingPath == false &&
          agent.path !== null &&
          agent.path.length > 0
        ) {
          const nextCell = agent.world.getCellAtCoordinates(
            agent.path[0].x,
            agent.path[0].y
          );
          agent.makeMove(nextCell);
        } else {
          agent.stage = "IN_GOAL";
          agent.hasReachedGoal();
        }
        break;
      case "IN_GOAL":
        if (Math.random() < agent.exitRate) {
          agent.stage = "LEAVING_GOAL";
        }
        break;
      case "LEAVING_GOAL":
        agent.changeMoveTo(agent.parked_cell.x, agent.parked_cell.y, () => {
          agent.stage = "MOVING_TO_PARKING_LEAVING";
        });
        break;
      case "MOVING_TO_PARKING_LEAVING":
        if (
          agent.calculatingPath == false &&
          agent.path !== null &&
          agent.path.length > 0
        ) {
          const nextCell = agent.world.getCellAtCoordinates(
            agent.path[0].x,
            agent.path[0].y
          );
          agent.makeMove(nextCell);
        } else {
          agent.stage = "UNPARKING";
        }
        break;
      case "UNPARKING":
        agent.unpark();
        agent.stage = "LEAVING";
        break;
      case "LEAVING":
        agent.changeMoveTo(agent.spawn.x, agent.spawn.y, () => {
          agent.stage = "MOVING_TO_EXIT";
        });
        break;
      case "MOVING_TO_EXIT":
        if (
          agent.calculatingPath == false &&
          agent.path !== null &&
          agent.path.length > 0
        ) {
          const nextCell = agent.world.getCellAtCoordinates(
            agent.path[0].x,
            agent.path[0].y
          );
          agent.makeMove(nextCell);
        } else {
          agent.stage = "EXITED";
        }
        break;
      case "EXITED":
        agent.world.removeAgent(agent);
        break;
      default:
        console.log("NO STAGE");
    }
}