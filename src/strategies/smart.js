// SMART STRATEGY

export default function smart(agent) {
  // AUXILIARY FUNCTIONS
  function randomLotCoordinates(location) {
    var coordinates = new Array(1);

    if (location == "north") {
      coordinates[0] = agent.randomValueInRange(20, 30);
      coordinates[1] = agent.randomValueInRange(4, 7);
    }
    if (location == "east") {
      coordinates[0] = agent.randomValueInRange(23, 29);
      if (Math.random() < 0.66) {
        coordinates[1] = agent.randomValueInRange(19, 21);
      } else {
        coordinates[1] = 23;
      }
    }
    if (location == "mid") {
      coordinates[0] = agent.randomValueInRange(10, 17);
      coordinates[1] = agent.randomValueInRange(17, 19);
    }
    if (location == "west") {
      coordinates[0] = agent.randomValueInRange(4, 6);
      coordinates[1] = agent.randomValueInRange(17, 20);
    }

    return coordinates;
  }

  switch (agent.stage) {
    case "ENTERING":
      agent.lotChoice =
        agent.lots[Math.floor(Math.random() * agent.lots.length)];

      var coordinates = randomLotCoordinates(agent.lotChoice);

      agent.changeMoveTo(coordinates[0], coordinates[1], () => {
        agent.stage = "MOVE_TO_LOT";
      });
      break;
    case "CHANGE_CHOICE":
      while (true) {
        var choice = agent.lots[Math.floor(Math.random() * agent.lots.length)];

        if (choice != agent.lotChoice) {
          agent.lotChoice = choice;
          break;
        }
      }

      var coordinates = randomLotCoordinates(agent.lotChoice);
      agent.changeMoveTo(coordinates[0], coordinates[1], () => {
        agent.stage = "MOVE_TO_LOT";
      });
      break;

    case "MOVE_TO_LOT":
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

        if (agent.path.length < 5) {
          agent.stage = "EVALUATE_LOT";
        }
      } else {
        agent.stage = "PARKING";
      }
      break;
    case "EVALUATE_LOT":
      if (agent.world.getLotCapacity(agent.lotChoice) > 0.9) {
        agent.stage = "CHANGE_CHOICE";
      } else {
        agent.stage = "MOVE_TO_LOT";
      }
      break;
    case "SEARCHING_IN_LOT":
      var coordinates = randomLotCoordinates(agent.lotChoice);
      agent.changeMoveTo(coordinates[0], coordinates[1], () => {
        agent.stage = "MOVE_TO_LOT";
      });
      break;
    case "PARKING":
      if (agent.park(agent.lotChoice)) {
        agent.stage = "LEAVING_PARKING";
      } else {
        // console.warn("Could not park");
        agent.failedToPark += 1;
        if (agent.failedToPark > agent.searchTime) {
          agent.stage = "ENTERING";
          agent.failedToPark = 0;
        } else {
          agent.stage = "SEARCHING_IN_LOT";
        }
      }
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
      agent.unpark(agent.lotChoice);
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
      console.log("Unknown stage: ", agent.stage);
      break;
  }
}
