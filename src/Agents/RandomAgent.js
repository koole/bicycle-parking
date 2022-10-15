import Agent from "../Agent";

class RandomAgent extends Agent {
  constructor(world, type, cell) {
    super(world, type, cell, "SMART");
    // ...
  }

  act() {
    this.startAct();
    // ...
  }
}