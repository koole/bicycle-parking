import Agent from "../Agent";

class SmartAgent extends Agent {
  constructor(world, type, cell) {
    super(world, type, cell, "SMART");

    // Variables relating to lot preferences.
    this.lots = ["north", "east", "mid", "west"];
    this.lotChoice = null;
    // NORTH, EAST, MID, WEST
    this.lotPreference = [
      Math.random(),
      Math.random(),
      Math.random(),
      Math.random(),
    ];
    this.changePreference = 0.01; // The amount preference changes upon update.

    // Variables for searching in lot.
    this.searchPath = [];
    this.searchTime = 6; // Tolances to look for a spot to park. Changes lot when searchFail == searchTime
    this.searchFail = 0;
  }

  ////////////////////////
  // STRATEGY EXECUTION //
  ////////////////////////

  // AUXILIARY FUNCTIONS //
  randomValueInRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  // Just returns the coordinates of a random parking spot depending on the location called.
  randomLotCoordinates(location) {
    // Returns random parking coordinates at the given location.
    var coordinates = new Array(1);

    if (location == "north") {
      coordinates[0] = this.randomValueInRange(20, 30);
      coordinates[1] = this.randomValueInRange(4, 7);
    }
    if (location == "east") {
      coordinates[0] = this.randomValueInRange(23, 29);
      if (Math.random() < 0.66) {
        coordinates[1] = this.randomValueInRange(19, 21);
      } else {
        coordinates[1] = 23;
      }
    }
    if (location == "mid") {
      coordinates[0] = this.randomValueInRange(10, 17);
      coordinates[1] = this.randomValueInRange(17, 19);
    }
    if (location == "west") {
      coordinates[0] = this.randomValueInRange(4, 6);
      coordinates[1] = this.randomValueInRange(17, 20);
    }

    return coordinates;
  }

  //Gets all the parking neighbours of the goal spot where the agent wants to park
  getNeighbourSpotsInLot(goal_cell) {
    
    for (let X=goal_cell.x - 1; X <= goal_cell.x +1; X++){
      for (let Y=goal_cell.y - 1; Y <= goal_cell.y +1; Y++) {
        if (this.world.state[Y][X].type == "PARKING") {
          if(X == goal_cell.x && Y == goal_cell.y) continue;
          var coordinates = new Array(1);
          coordinates[0] = X;
          coordinates[1] = Y;

          this.searchPath.push(coordinates);
        }
      }
    }
    return this.searchPath;
  }

  lotSearch() {
    var coordinates = new Array(1);
    const goal_cell = this.world.getCellAtCoordinates(this.move_to[0], this.move_to[1]);
    
    coordinates[0] = goal_cell.x;
    coordinates[1] = goal_cell.y;
    console.log("first goal was " + coordinates[0] + " and " + coordinates[1])

      for (let X = 0; X < this.searchPath.length; X++){
      const new_goal_cell = this.world.getCellAtCoordinates(this.searchPath[X][0], this.searchPath[X][1]);
        if(new_goal_cell.canPark()){
          coordinates[0] = new_goal_cell.x;
          coordinates[1] = new_goal_cell.y;
          console.log("UPDATED goal was " + coordinates[0] + " and " + coordinates[1])
          break;
        }
      }

    console.log("END "+coordinates[0] + " and " + coordinates[1])
    return coordinates;
  }

  // Returns the preference with the highest value.
  checkPreference() {
    var maxPref = Math.max(...this.lotPreference);
    var index = this.lotPreference.indexOf(maxPref);
    return this.lots[index];
  }

  // Basically the update functions for the agents. This one increases one option and decreases the others.
  increasePreference(location) {
    var index = this.lots.indexOf(location);

    for (let i = 0; i < this.lots.length; i++) {
      if (i == index) {
        this.lotPreference[i] += this.changePreference;
      } else {
        this.lotPreference[i] -= this.changePreference;
      }

      this.lotPreference[i] = Math.round(this.lotPreference[i] * 100.0) / 100.0;

      this.lotPreference[i] =
        this.lotPreference[i] > 1
          ? (this.lotPreference[i] = 1)
          : this.lotPreference[i];

      this.lotPreference[i] =
        this.lotPreference[i] < 0
          ? (this.lotPreference[i] = 0)
          : this.lotPreference[i];
    }
  }

  // Basically the update functions for the agents. This one decreases one option and increases the others.
  decreasePreference(location) {
    var index = this.lots.indexOf(location);

    for (let i = 0; i < this.lots.length; i++) {
      if (i == index) {
        this.lotPreference[i] -= this.changePreference;
      } else {
        this.lotPreference[i] += this.changePreference;
      }

      this.lotPreference[i] = Math.round(this.lotPreference[i] * 100.0) / 100.0;

      this.lotPreference[i] =
        this.lotPreference[i] > 1
          ? (this.lotPreference[i] = 1)
          : this.lotPreference[i];

      this.lotPreference[i] =
        this.lotPreference[i] < 0
          ? (this.lotPreference[i] = 0)
          : this.lotPreference[i];
    }
  }

  // SMART STRATEGY //
  act() {
    this.startAct();

    switch (this.stage) {
      case "SPAWN":
        this.lotChoice = this.checkPreference();
        var coordinates = this.randomLotCoordinates(this.lotChoice);

        this.changeMoveTo(coordinates[0], coordinates[1], () => {
          this.stage = "MOVE_TO_LOT";
        });
        const goal_cell = this.world.getCellAtCoordinates(this.move_to[0], this.move_to[1]);

        this.getNeighbourSpotsInLot(goal_cell);
        break;
      case "CHANGE_CHOICE":
        this.decreasePreference(this.lotChoice);

        while (true) {
          var choice = this.lots[Math.floor(Math.random() * this.lots.length)];

          if (choice != this.lotChoice) {
            this.lotChoice = choice;
            break;
          }
        }

        var coordinates = this.randomLotCoordinates(this.lotChoice);
        this.changeMoveTo(coordinates[0], coordinates[1], () => {
          this.stage = "MOVE_TO_LOT";
        });
        break;
      case "MOVE_TO_LOT":
        // console.log("movetolot")
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

          if (this.path.length < 5) {
            this.stage = "EVALUATE_LOT";
            if (this.path.length < 2){
              const goal_cell = this.world.getCellAtCoordinates(this.move_to[0], this.move_to[1]);
              if(goal_cell.canPark() != true){
                this.stage = "SEARCHING_IN_LOT"
              }
            }
          } 
          
        } else if (this.calculatingPath == false) {
          this.stage = "PARKING";
        }
        break;
      case "EVALUATE_LOT":
        if (this.world.getLotCapacity(this.lotChoice) > 0.8) {
          this.stage = "CHANGE_CHOICE";
        } else {
          this.stage = "MOVE_TO_LOT";
        }
        break;
      case "SEARCHING_IN_LOT":
        var coordinates = this.lotSearch();
        this.changeMoveTo(coordinates[0], coordinates[1], () => {
          this.stage = "MOVE_TO_LOT";
        });
        break;
      case "PARKING":
        if (this.park(this.lotChoice)) {
          this.stage = "LEAVING_PARKING";
          this.increasePreference(this.lotChoice);
        } else {
          // console.warn("Could not park");
          this.searchFail += 1;
          if (this.searchFail > this.searchTime) {
            this.stage = "CHANGE_CHOICE";
            this.searchFail = 0;
          } else {
            this.stage = "SEARCHING_IN_LOT";
          }
        }
        break;
      default:
        this.finishedParkingStages();
        break;
    }
  }
}

export default SmartAgent;
