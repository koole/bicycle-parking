export default function lotPreference(agent) {
  switch (agent.stage) {
    case "ENTERING":
      agent.lotPreference =
        agent.lots[Math.floor(Math.random() * agent.lots.length)];
      if (
        agent.lotPreference == "north" &&
        agent.spawn.x == 35 &&
        agent.spawn.y == 5
      ) {
        var coordinates = [30, agent.randomValueInRange(4, 7)];
      } else {
        var coordinates = agent.lotMove(agent.lotPreference);
      }

      agent.changeMoveTo(coordinates[0], coordinates[1], () => {
        agent.stage = "MOVING_TO_LOT";
      });
      break;
    case "MOVING_TO_LOT":
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
        agent.stage = "SEARCHING_IN_LOT";
      }
      break;
    case "SEARCHING_IN_LOT":
      var coordinates = agent.lotSearch(agent.lotPreference);
      agent.changeMoveTo(coordinates[0], coordinates[1], () => {
        agent.stage = "MOVING_TO_SPOT";
      });
      break;
    case "MOVING_TO_SPOT":
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
    case "PARKING":
      if (agent.park()) {
        agent.stage = "LEAVING_PARKING";
      } else {
        // console.warn("Could not park");
        agent.failedToPark += 1;
        if (agent.failedToPark > agent.searchTime) {
          agent.stage = "CHANGEPREF";
          agent.failedToPark = 0;
        } else {
          agent.stage = "SEARCHING_IN_LOT";
        }
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
      const buildingCell = agent.world.getRandomCellOfType("BUILDING_ENTRANCE");
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
