// RANDOM STRATEGY

export default function random(agent) {
  switch (agent.stage) {
    case "ENTERING":
      const parkingCell = agent.world.getRandomCellOfType("PARKING");
      agent.changeMoveTo(parkingCell.x, parkingCell.y, () => {
        agent.stage = "MOVING_TO_PARKING_ENTERING";
      });
      break;
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
    case "PARKING":
      if (agent.park()) {
        agent.stage = "LEAVING_PARKING";
      } else {
        // console.warn("Could not park");
        agent.stage = "ENTERING";
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
      console.log("Unknown stage: ", agent.stage);
      break;
  }
}
