// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"node_modules/parcel-bundler/src/builtins/bundle-url.js":[function(require,module,exports) {
var bundleURL = null;

function getBundleURLCached() {
  if (!bundleURL) {
    bundleURL = getBundleURL();
  }

  return bundleURL;
}

function getBundleURL() {
  // Attempt to find the URL of the current script and use that as the base URL
  try {
    throw new Error();
  } catch (err) {
    var matches = ('' + err.stack).match(/(https?|file|ftp|chrome-extension|moz-extension):\/\/[^)\n]+/g);

    if (matches) {
      return getBaseURL(matches[0]);
    }
  }

  return '/';
}

function getBaseURL(url) {
  return ('' + url).replace(/^((?:https?|file|ftp|chrome-extension|moz-extension):\/\/.+)?\/[^/]+(?:\?.*)?$/, '$1') + '/';
}

exports.getBundleURL = getBundleURLCached;
exports.getBaseURL = getBaseURL;
},{}],"node_modules/parcel-bundler/src/builtins/css-loader.js":[function(require,module,exports) {
var bundle = require('./bundle-url');

function updateLink(link) {
  var newLink = link.cloneNode();

  newLink.onload = function () {
    link.remove();
  };

  newLink.href = link.href.split('?')[0] + '?' + Date.now();
  link.parentNode.insertBefore(newLink, link.nextSibling);
}

var cssTimeout = null;

function reloadCSS() {
  if (cssTimeout) {
    return;
  }

  cssTimeout = setTimeout(function () {
    var links = document.querySelectorAll('link[rel="stylesheet"]');

    for (var i = 0; i < links.length; i++) {
      if (bundle.getBaseURL(links[i].href) === bundle.getBundleURL()) {
        updateLink(links[i]);
      }
    }

    cssTimeout = null;
  }, 50);
}

module.exports = reloadCSS;
},{"./bundle-url":"node_modules/parcel-bundler/src/builtins/bundle-url.js"}],"src/styles.css":[function(require,module,exports) {
var reloadCSS = require('_css_loader');

module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
},{"_css_loader":"node_modules/parcel-bundler/src/builtins/css-loader.js"}],"src/map.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mapDirection = exports.default = void 0;
var map = "\n____________________________________\nbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb__\nbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb__\n_bbw______________aa____________bb__\n_bbw______________aappppppppppa_bb__\n_bbw______________aappppppppppaaaaaS\n_bbw______________aappppppppppaaaaaE\n_bbw______________aa________________\n_bbw__ooooooooooooaa________________\n_bbw__ooooooooooooaa________________\n_bbw__ooooooooooooaa________________\n_bbw__ooooooooooooaa________________\n_bbw__ooooooooooooaa________________\n_bbw__ooooooooooooaa________________\n_bbw__ooooooooooooaa________________\n_bbw__ooooooooooooaa________________\n_bbwwwooooooooooooaa________________\n_bbappoooopppppppoaa________________\n_bbappoooopppppppoaa________________\n_bbappooooooooooaaaa___pppppp_______\n_bbwwwooooooooooooaa___pppppp_______\n_bbwwwoooooooooooXaaaaaaaaaaaaaaaaaS\n_bbwwwooooooooooooaaaaaaaaaaaaaaaaaE\n_bbwwwooooooooooooaa___pppppp_______\n_bbwwwooooooooooooaa________________\n_bbaaa____________aa________________\n_bbaaaaaaaaaaaaaaaaaa_______________\n_bbaaaaaaaaaaaaaaaaaa_______________\n_bbw_____________aaaaa______________\n_bbw______________aaaaa_____________\n_bbw______________aaaaa_____________\n_bbw________________________________\n_bbw________________________________\n_bbw________________________________\n_bbw________________________________\n_ESw________________________________\n";
var mapDirection = "\n____________________________________\nwawwwwwwwwwwwwwwwwaawwwwwwwwwwwwwa__\neaaeeeeeeeeeeeeeeeaaeeeeeeeeeeeean__\n_sna______________sn____________sn__\n_sna______________aahhhhhhhhhha_sn__\n_sna______________aahhhhhhhhhhaaaaaa\n_sna______________aahhhhhhhhhhaaaaaa\n_sna______________sn________________\n_sna______________sn________________\n_sna______________sn________________\n_sna______________sn________________\n_sna______________sn________________\n_sna______________sn________________\n_sna______________sn________________\n_sna______________sn________________\n_sna______________sn________________\n_aaaaa____________sn________________\n_aaahh____hhhhhha_sn________________\n_aaahh____hhhhhha_sn________________\n_aaahh__________aaaa___vvvvvv_______\n_snaaa____________sn___vvvvvv_______\n_snaaa___________aaawwwaaaaaawwwwwwa\n_snaaa____________aaeeeaaaaaaeeeeeea\n_snaaa____________sn___vvvvvv_______\n_snaaa____________sn________________\n_snaaa____________sn________________\n_aaawwwwwwwwwwwwwwana_______________\n_aaaeeeeeeeeeeeeeeeaa_______________\n_sna_____________aaaaa______________\n_sna______________aaaaa_____________\n_sna______________aaaaa_____________\n_sna________________________________\n_sna________________________________\n_sna________________________________\n_sna________________________________\n_aaa________________________________\n";
exports.mapDirection = mapDirection;
var _default = map;
exports.default = _default;
},{}],"src/Cell.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var MAX_PARKED_BIKES = 8;

var Cell = /*#__PURE__*/function () {
  function Cell(world, type, x, y, allowed_direction) {
    _classCallCheck(this, Cell);

    this.type = type;
    this.x = x;
    this.y = y;
    this.agents = [];
    this.bikes = 0;
    this.allowed_direction = allowed_direction;
  } // Check if agent can be added to this cell


  _createClass(Cell, [{
    key: "checkAddAgent",
    value: function checkAddAgent(agent) {
      if (this.type === "SPAWN") {
        return true;
      }

      if (this.type === "BUILDING_ENTRANCE" && agent.type === "PEDESTRIAN") {
        return true;
      } // Allow a maximum of:
      // 2 agents of type BIKE
      // or 3 agents of type PEDESTRIAN
      // or 1 agent of type BIKE and 2 agents of type PEDESTRIAN
      // or 2 agent of type BIKE and 1 agents of type PEDESTRIAN


      if (agent.type === "BIKE" && this.agents.filter(function (_ref) {
        var type = _ref.type;
        return type === "BIKE";
      }).length >= 2) {
        return false;
      }

      if (agent.type === "PEDESTRIAN" && this.agents.filter(function (_ref2) {
        var type = _ref2.type;
        return type === "PEDESTRIAN";
      }).length >= 3) {
        return false;
      }

      if (agent.type === "BIKE" && this.agents.filter(function (_ref3) {
        var type = _ref3.type;
        return type === "PEDESTRIAN";
      }).length >= 2) {
        return false;
      }

      if (agent.type === "PEDESTRIAN" && this.agents.filter(function (_ref4) {
        var type = _ref4.type;
        return type === "BIKE";
      }).length >= 3) {
        return false;
      }

      return true;
    }
  }, {
    key: "addAgent",
    value: function addAgent(agent) {
      this.agents.push(agent);
    }
  }, {
    key: "removeAgent",
    value: function removeAgent(agent) {
      this.agents = this.agents.filter(function (a) {
        return a !== agent;
      });
    }
  }, {
    key: "canPark",
    value: function canPark() {
      return this.type === "PARKING" && this.bikes < MAX_PARKED_BIKES;
    }
  }, {
    key: "addBike",
    value: function addBike() {
      this.bikes++;
    }
  }, {
    key: "removeBike",
    value: function removeBike() {
      this.bikes--;
    }
  }, {
    key: "draw",
    value: function draw(ctx, x, y, squareSize) {
      var _this = this;

      var canvas_x = x * squareSize;
      var canvas_y = y * squareSize;
      var color = "#fefefe";
      color = this.getCellColor(color);
      ctx.fillStyle = color;
      ctx.fillRect(canvas_x, canvas_y, squareSize, squareSize); // Draw progress bar for amount of parked bikes

      if (this.type === "PARKING") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(canvas_x + 2, canvas_y + squareSize - 8, squareSize - 4, 4);
        ctx.fillStyle = "#316cf4";
        ctx.fillRect(canvas_x + 2, canvas_y + squareSize - 8, (squareSize + 4) * (this.bikes / MAX_PARKED_BIKES), 4);
      }

      if (this.type === "BUILDING_ENTRANCE") {
        ctx.fillStyle = "#000000";
        ctx.font = "12px monospace";
        ctx.fillText("" + this.agents.filter(function (_ref5) {
          var type = _ref5.type;
          return type === "PEDESTRIAN";
        }).length, canvas_x + 2, canvas_y + 24);
      } else {
        var bikeAgents = this.agents.filter(function (_ref6) {
          var type = _ref6.type;
          return type === "BIKE";
        });
        var pedestrianAgents = this.agents.filter(function (_ref7) {
          var type = _ref7.type;
          return type === "PEDESTRIAN";
        });

        if (bikeAgents.length > 0) {
          bikeAgents.forEach(function (agent, i) {
            _this.drawBike(ctx, x * squareSize + i * 10, y * squareSize);
          });

          if (pedestrianAgents.length > 0) {
            pedestrianAgents.forEach(function (agent, i) {
              _this.drawPedestrian(ctx, x * squareSize + 10, y * squareSize + i * 10);
            });
          }
        } else if (pedestrianAgents.length > 0) {
          pedestrianAgents.forEach(function (agent, i) {
            if (i < 2) {
              _this.drawPedestrian(ctx, x * squareSize + i * 10, y * squareSize);
            } else {
              _this.drawPedestrian(ctx, x * squareSize + 5, y * squareSize + 10);
            }
          });
        }
      } // !! Debug to show number of agents in cell
      // if(["SPAWN", "BIKE_PATH", "PEDESTRIAN_PATH", "ALL_PATH", "PARKING", "BUILDING_ENTRANCE"].includes(this.type)) {
      //   ctx.font = '12px monospace';
      //   ctx.fillStyle = "black";
      //   // make text slightly transparent
      //   ctx.globalAlpha = 0.3;
      //   ctx.fillText("B:" + this.agents.filter(({type}) => type === "BIKE").length, canvas_x + 2, canvas_y + 12);
      //   ctx.fillText("P:" + this.agents.filter(({type}) => type === "PEDESTRIAN").length, canvas_x + 2, canvas_y + 24);
      //   // reset transparency
      //   ctx.globalAlpha = 1;
      // }
      // !! Draws directions in which agents are allowed to move
      // ctx.font = '14px monospace';
      // ctx.fillStyle = "black";
      // // make text slightly transparent
      // ctx.globalAlpha = 0.5;
      // ctx.fillText(this.allowed_direction, canvas_x + 2, canvas_y + 24);
      // // reset transparency
      // ctx.globalAlpha = 1;

    } // Drawing utilities, nothing important after this point :)

  }, {
    key: "getCellColor",
    value: function getCellColor(color) {
      switch (this.type) {
        case "SPAWN":
          color = "#e7b1b6";
          break;

        case "BIKE_PATH":
          color = "#f3d8da";
          break;

        case "PEDESTRIAN_PATH":
          color = "#eaecef";
          break;

        case "ALL_PATH":
          color = "#cfd4d9";
          break;

        case "PARKING":
          color = "#aeb5bc";
          break;

        case "EMPTY":
          color = "#d5e6de";
          break;

        case "BUILDING":
          color = "#a6c4f9";
          break;

        case "BUILDING_ENTRANCE":
          color = "#7ba6f7";
          break;

        case "EXIT":
          color = "#e7b1b6";
          break;
      }

      return color;
    }
  }, {
    key: "drawBike",
    value: function drawBike(ctx, x, y) {
      ctx.fillStyle = "#222529";
      ctx.fillRect(x + 6, y + 2, 5, 20);
    }
  }, {
    key: "drawPedestrian",
    value: function drawPedestrian(ctx, x, y) {
      ctx.fillStyle = "#fd7e14";
      ctx.fillRect(x + 6, y + 2, 5, 5);
    }
  }]);

  return Cell;
}();

var _default = Cell;
exports.default = _default;
},{}],"src/Agent.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _index = require("./index");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var Agent = /*#__PURE__*/function () {
  function Agent(world, type, cell, strategy) {
    _classCallCheck(this, Agent);

    this.world = world;
    this.type = type;
    this.spawn = cell;
    this.cell = cell;
    this.parked_cell = null;
    this.strategy = strategy;
    this.move_to = null; // This is for storing the calculated path
    // and not recalculating it every tick

    this.path = null;
    this.calculatingPath = false;
    this.stage = "ENTERING";
    this.ticks = 0;
    this.ticks_to_parked = null;
    this.ticks_to_goal = null;
  }

  _createClass(Agent, [{
    key: "getPathfinder",
    value: function getPathfinder() {
      return this.type === "BIKE" ? this.world.bikePathfinder : this.world.pedestrianPathfinder;
    }
  }, {
    key: "hasParked",
    value: function hasParked() {
      this.ticks_to_parked = this.ticks;
      (0, _index.addTimeToPark)(this.ticks_to_parked);
    }
  }, {
    key: "hasReachedGoal",
    value: function hasReachedGoal() {
      this.ticks_to_goal = this.ticks;
      (0, _index.addTimeToGoal)(this.ticks_to_goal);
    }
  }, {
    key: "park",
    value: function park() {
      if (this.cell.canPark()) {
        if (this.type === "BIKE" && this.cell.type === "PARKING" && this.parked_cell === null) {
          this.parked_cell = this.cell;
          this.type = "PEDESTRIAN";
          this.cell.addBike();
          this.hasParked();
          return true;
        }
      }

      return false;
    }
  }, {
    key: "unpark",
    value: function unpark() {
      if (this.type === "PEDESTRIAN" && this.cell.type === "PARKING" && this.parked_cell !== null) {
        this.cell.removeBike();
        this.parked_cell = null;
        this.type = "BIKE";
      }
    }
  }, {
    key: "changeMoveTo",
    value: function changeMoveTo(x, y, callback) {
      var _this = this;

      this.calculatingPath = true;
      this.move_to = [x, y];
      this.path = null;
      var pathfinder = this.getPathfinder();
      pathfinder.findPath(this.cell.x, this.cell.y, this.move_to[0], this.move_to[1], function (path) {
        if (path !== null) {
          _this.path = path;
        } else {
          console.log("Agent has no way to reach its goal");
        }

        _this.calculatingPath = false;

        if (callback && path !== null) {
          callback();
        }
      });
      pathfinder.calculate();
    }
  }, {
    key: "makeMove",
    value: function makeMove(nextCell) {
      if (nextCell.checkAddAgent(this)) {
        this.world.moveAgent(this, nextCell);
        this.path.shift();
      }
    } // WORK ON AGENT STRATS HERE -->

  }, {
    key: "act",
    value: function act() {
      var _this2 = this;

      this.ticks += 1;

      switch (this.strategy) {
        case "TEST_STRATEGY":
          switch (this.stage) {
            case "ENTERING":
              var parkingCell = this.world.getRandomCellOfType("PARKING");
              this.changeMoveTo(parkingCell.x, parkingCell.y, function () {
                _this2.stage = "MOVING_TO_PARKING_ENTERING";
              });
              break;

            case "MOVING_TO_PARKING_ENTERING":
              if (this.calculatingPath == false && this.path !== null && this.path.length > 0) {
                var nextCell = this.world.getCellAtCoordinates(this.path[0].x, this.path[0].y);
                this.makeMove(nextCell);
              } else {
                this.stage = "PARKING";
              }

              break;

            case "PARKING":
              if (this.park()) {
                this.stage = "LEAVING_PARKING";
              } else {
                console.log("Could not park");
              }

              break;

            case "LEAVING_PARKING":
              var buildingCell = this.world.getRandomCellOfType("BUILDING_ENTRANCE");
              this.changeMoveTo(buildingCell.x, buildingCell.y, function () {
                _this2.stage = "MOVING_TO_GOAL";
              });
              break;

            case "MOVING_TO_GOAL":
              if (this.calculatingPath == false && this.path !== null && this.path.length > 0) {
                var _nextCell = this.world.getCellAtCoordinates(this.path[0].x, this.path[0].y);

                this.makeMove(_nextCell);
              } else {
                this.stage = "IN_GOAL";
                this.hasReachedGoal();
              }

              break;

            case "IN_GOAL":
              // Todo: Wait for a bit
              this.stage = "LEAVING_GOAL";
              break;

            case "LEAVING_GOAL":
              this.changeMoveTo(this.parked_cell.x, this.parked_cell.y, function () {
                _this2.stage = "MOVING_TO_PARKING_LEAVING";
              });
              break;

            case "MOVING_TO_PARKING_LEAVING":
              if (this.calculatingPath == false && this.path !== null && this.path.length > 0) {
                var _nextCell2 = this.world.getCellAtCoordinates(this.path[0].x, this.path[0].y);

                this.makeMove(_nextCell2);
              } else {
                this.stage = "UNPARKING";
              }

              break;

            case "UNPARKING":
              this.unpark();
              this.stage = "LEAVING";
              break;

            case "LEAVING":
              this.changeMoveTo(this.spawn.x, this.spawn.y, function () {
                _this2.stage = "MOVING_TO_EXIT";
              });
              break;

            case "MOVING_TO_EXIT":
              if (this.calculatingPath == false && this.path !== null && this.path.length > 0) {
                var _nextCell3 = this.world.getCellAtCoordinates(this.path[0].x, this.path[0].y);

                this.makeMove(_nextCell3);
              } else {
                this.stage = "EXITED";
              }

              break;

            case "EXITED":
              this.world.removeAgent(this);
              break;

            default:
              console.log("Unknown stage: ", this.stage);
              break;
          }

          break;

        default:
          console.log("Unknown strategy: ", this.strategy);
      }
    }
  }]);

  return Agent;
}();

var _default = Agent;
exports.default = _default;
},{"./index":"src/index.js"}],"node_modules/easystarjs/src/instance.js":[function(require,module,exports) {
/**
 * Represents a single instance of EasyStar.
 * A path that is in the queue to eventually be found.
 */
module.exports = function() {
    this.pointsToAvoid = {};
    this.startX;
    this.callback;
    this.startY;
    this.endX;
    this.endY;
    this.nodeHash = {};
    this.openList;
};
},{}],"node_modules/easystarjs/src/node.js":[function(require,module,exports) {
/**
* A simple Node that represents a single tile on the grid.
* @param {Object} parent The parent node.
* @param {Number} x The x position on the grid.
* @param {Number} y The y position on the grid.
* @param {Number} costSoFar How far this node is in moves*cost from the start.
* @param {Number} simpleDistanceToTarget Manhatten distance to the end point.
**/
module.exports = function(parent, x, y, costSoFar, simpleDistanceToTarget) {
    this.parent = parent;
    this.x = x;
    this.y = y;
    this.costSoFar = costSoFar;
    this.simpleDistanceToTarget = simpleDistanceToTarget;

    /**
    * @return {Number} Best guess distance of a cost using this node.
    **/
    this.bestGuessDistance = function() {
        return this.costSoFar + this.simpleDistanceToTarget;
    }
};
},{}],"node_modules/heap/lib/heap.js":[function(require,module,exports) {
var define;
// Generated by CoffeeScript 1.8.0
(function() {
  var Heap, defaultCmp, floor, heapify, heappop, heappush, heappushpop, heapreplace, insort, min, nlargest, nsmallest, updateItem, _siftdown, _siftup;

  floor = Math.floor, min = Math.min;


  /*
  Default comparison function to be used
   */

  defaultCmp = function(x, y) {
    if (x < y) {
      return -1;
    }
    if (x > y) {
      return 1;
    }
    return 0;
  };


  /*
  Insert item x in list a, and keep it sorted assuming a is sorted.
  
  If x is already in a, insert it to the right of the rightmost x.
  
  Optional args lo (default 0) and hi (default a.length) bound the slice
  of a to be searched.
   */

  insort = function(a, x, lo, hi, cmp) {
    var mid;
    if (lo == null) {
      lo = 0;
    }
    if (cmp == null) {
      cmp = defaultCmp;
    }
    if (lo < 0) {
      throw new Error('lo must be non-negative');
    }
    if (hi == null) {
      hi = a.length;
    }
    while (lo < hi) {
      mid = floor((lo + hi) / 2);
      if (cmp(x, a[mid]) < 0) {
        hi = mid;
      } else {
        lo = mid + 1;
      }
    }
    return ([].splice.apply(a, [lo, lo - lo].concat(x)), x);
  };


  /*
  Push item onto heap, maintaining the heap invariant.
   */

  heappush = function(array, item, cmp) {
    if (cmp == null) {
      cmp = defaultCmp;
    }
    array.push(item);
    return _siftdown(array, 0, array.length - 1, cmp);
  };


  /*
  Pop the smallest item off the heap, maintaining the heap invariant.
   */

  heappop = function(array, cmp) {
    var lastelt, returnitem;
    if (cmp == null) {
      cmp = defaultCmp;
    }
    lastelt = array.pop();
    if (array.length) {
      returnitem = array[0];
      array[0] = lastelt;
      _siftup(array, 0, cmp);
    } else {
      returnitem = lastelt;
    }
    return returnitem;
  };


  /*
  Pop and return the current smallest value, and add the new item.
  
  This is more efficient than heappop() followed by heappush(), and can be
  more appropriate when using a fixed size heap. Note that the value
  returned may be larger than item! That constrains reasonable use of
  this routine unless written as part of a conditional replacement:
      if item > array[0]
        item = heapreplace(array, item)
   */

  heapreplace = function(array, item, cmp) {
    var returnitem;
    if (cmp == null) {
      cmp = defaultCmp;
    }
    returnitem = array[0];
    array[0] = item;
    _siftup(array, 0, cmp);
    return returnitem;
  };


  /*
  Fast version of a heappush followed by a heappop.
   */

  heappushpop = function(array, item, cmp) {
    var _ref;
    if (cmp == null) {
      cmp = defaultCmp;
    }
    if (array.length && cmp(array[0], item) < 0) {
      _ref = [array[0], item], item = _ref[0], array[0] = _ref[1];
      _siftup(array, 0, cmp);
    }
    return item;
  };


  /*
  Transform list into a heap, in-place, in O(array.length) time.
   */

  heapify = function(array, cmp) {
    var i, _i, _j, _len, _ref, _ref1, _results, _results1;
    if (cmp == null) {
      cmp = defaultCmp;
    }
    _ref1 = (function() {
      _results1 = [];
      for (var _j = 0, _ref = floor(array.length / 2); 0 <= _ref ? _j < _ref : _j > _ref; 0 <= _ref ? _j++ : _j--){ _results1.push(_j); }
      return _results1;
    }).apply(this).reverse();
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      i = _ref1[_i];
      _results.push(_siftup(array, i, cmp));
    }
    return _results;
  };


  /*
  Update the position of the given item in the heap.
  This function should be called every time the item is being modified.
   */

  updateItem = function(array, item, cmp) {
    var pos;
    if (cmp == null) {
      cmp = defaultCmp;
    }
    pos = array.indexOf(item);
    if (pos === -1) {
      return;
    }
    _siftdown(array, 0, pos, cmp);
    return _siftup(array, pos, cmp);
  };


  /*
  Find the n largest elements in a dataset.
   */

  nlargest = function(array, n, cmp) {
    var elem, result, _i, _len, _ref;
    if (cmp == null) {
      cmp = defaultCmp;
    }
    result = array.slice(0, n);
    if (!result.length) {
      return result;
    }
    heapify(result, cmp);
    _ref = array.slice(n);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      elem = _ref[_i];
      heappushpop(result, elem, cmp);
    }
    return result.sort(cmp).reverse();
  };


  /*
  Find the n smallest elements in a dataset.
   */

  nsmallest = function(array, n, cmp) {
    var elem, i, los, result, _i, _j, _len, _ref, _ref1, _results;
    if (cmp == null) {
      cmp = defaultCmp;
    }
    if (n * 10 <= array.length) {
      result = array.slice(0, n).sort(cmp);
      if (!result.length) {
        return result;
      }
      los = result[result.length - 1];
      _ref = array.slice(n);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        elem = _ref[_i];
        if (cmp(elem, los) < 0) {
          insort(result, elem, 0, null, cmp);
          result.pop();
          los = result[result.length - 1];
        }
      }
      return result;
    }
    heapify(array, cmp);
    _results = [];
    for (i = _j = 0, _ref1 = min(n, array.length); 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
      _results.push(heappop(array, cmp));
    }
    return _results;
  };

  _siftdown = function(array, startpos, pos, cmp) {
    var newitem, parent, parentpos;
    if (cmp == null) {
      cmp = defaultCmp;
    }
    newitem = array[pos];
    while (pos > startpos) {
      parentpos = (pos - 1) >> 1;
      parent = array[parentpos];
      if (cmp(newitem, parent) < 0) {
        array[pos] = parent;
        pos = parentpos;
        continue;
      }
      break;
    }
    return array[pos] = newitem;
  };

  _siftup = function(array, pos, cmp) {
    var childpos, endpos, newitem, rightpos, startpos;
    if (cmp == null) {
      cmp = defaultCmp;
    }
    endpos = array.length;
    startpos = pos;
    newitem = array[pos];
    childpos = 2 * pos + 1;
    while (childpos < endpos) {
      rightpos = childpos + 1;
      if (rightpos < endpos && !(cmp(array[childpos], array[rightpos]) < 0)) {
        childpos = rightpos;
      }
      array[pos] = array[childpos];
      pos = childpos;
      childpos = 2 * pos + 1;
    }
    array[pos] = newitem;
    return _siftdown(array, startpos, pos, cmp);
  };

  Heap = (function() {
    Heap.push = heappush;

    Heap.pop = heappop;

    Heap.replace = heapreplace;

    Heap.pushpop = heappushpop;

    Heap.heapify = heapify;

    Heap.updateItem = updateItem;

    Heap.nlargest = nlargest;

    Heap.nsmallest = nsmallest;

    function Heap(cmp) {
      this.cmp = cmp != null ? cmp : defaultCmp;
      this.nodes = [];
    }

    Heap.prototype.push = function(x) {
      return heappush(this.nodes, x, this.cmp);
    };

    Heap.prototype.pop = function() {
      return heappop(this.nodes, this.cmp);
    };

    Heap.prototype.peek = function() {
      return this.nodes[0];
    };

    Heap.prototype.contains = function(x) {
      return this.nodes.indexOf(x) !== -1;
    };

    Heap.prototype.replace = function(x) {
      return heapreplace(this.nodes, x, this.cmp);
    };

    Heap.prototype.pushpop = function(x) {
      return heappushpop(this.nodes, x, this.cmp);
    };

    Heap.prototype.heapify = function() {
      return heapify(this.nodes, this.cmp);
    };

    Heap.prototype.updateItem = function(x) {
      return updateItem(this.nodes, x, this.cmp);
    };

    Heap.prototype.clear = function() {
      return this.nodes = [];
    };

    Heap.prototype.empty = function() {
      return this.nodes.length === 0;
    };

    Heap.prototype.size = function() {
      return this.nodes.length;
    };

    Heap.prototype.clone = function() {
      var heap;
      heap = new Heap();
      heap.nodes = this.nodes.slice(0);
      return heap;
    };

    Heap.prototype.toArray = function() {
      return this.nodes.slice(0);
    };

    Heap.prototype.insert = Heap.prototype.push;

    Heap.prototype.top = Heap.prototype.peek;

    Heap.prototype.front = Heap.prototype.peek;

    Heap.prototype.has = Heap.prototype.contains;

    Heap.prototype.copy = Heap.prototype.clone;

    return Heap;

  })();

  (function(root, factory) {
    if (typeof define === 'function' && define.amd) {
      return define([], factory);
    } else if (typeof exports === 'object') {
      return module.exports = factory();
    } else {
      return root.Heap = factory();
    }
  })(this, function() {
    return Heap;
  });

}).call(this);

},{}],"node_modules/heap/index.js":[function(require,module,exports) {
module.exports = require('./lib/heap');

},{"./lib/heap":"node_modules/heap/lib/heap.js"}],"node_modules/easystarjs/src/easystar.js":[function(require,module,exports) {
/**
*   EasyStar.js
*   github.com/prettymuchbryce/EasyStarJS
*   Licensed under the MIT license.
*
*   Implementation By Bryce Neal (@prettymuchbryce)
**/

var EasyStar = {}
var Instance = require('./instance');
var Node = require('./node');
var Heap = require('heap');

const CLOSED_LIST = 0;
const OPEN_LIST = 1;

module.exports = EasyStar;

var nextInstanceId = 1;

EasyStar.js = function() {
    var STRAIGHT_COST = 1.0;
    var DIAGONAL_COST = 1.4;
    var syncEnabled = false;
    var pointsToAvoid = {};
    var collisionGrid;
    var costMap = {};
    var pointsToCost = {};
    var directionalConditions = {};
    var allowCornerCutting = true;
    var iterationsSoFar;
    var instances = {};
    var instanceQueue = [];
    var iterationsPerCalculation = Number.MAX_VALUE;
    var acceptableTiles;
    var diagonalsEnabled = false;

    /**
    * Sets the collision grid that EasyStar uses.
    *
    * @param {Array|Number} tiles An array of numbers that represent
    * which tiles in your grid should be considered
    * acceptable, or "walkable".
    **/
    this.setAcceptableTiles = function(tiles) {
        if (tiles instanceof Array) {
            // Array
            acceptableTiles = tiles;
        } else if (!isNaN(parseFloat(tiles)) && isFinite(tiles)) {
            // Number
            acceptableTiles = [tiles];
        }
    };

    /**
    * Enables sync mode for this EasyStar instance..
    * if you're into that sort of thing.
    **/
    this.enableSync = function() {
        syncEnabled = true;
    };

    /**
    * Disables sync mode for this EasyStar instance.
    **/
    this.disableSync = function() {
        syncEnabled = false;
    };

    /**
     * Enable diagonal pathfinding.
     */
    this.enableDiagonals = function() {
        diagonalsEnabled = true;
    }

    /**
     * Disable diagonal pathfinding.
     */
    this.disableDiagonals = function() {
        diagonalsEnabled = false;
    }

    /**
    * Sets the collision grid that EasyStar uses.
    *
    * @param {Array} grid The collision grid that this EasyStar instance will read from.
    * This should be a 2D Array of Numbers.
    **/
    this.setGrid = function(grid) {
        collisionGrid = grid;

        //Setup cost map
        for (var y = 0; y < collisionGrid.length; y++) {
            for (var x = 0; x < collisionGrid[0].length; x++) {
                if (!costMap[collisionGrid[y][x]]) {
                    costMap[collisionGrid[y][x]] = 1
                }
            }
        }
    };

    /**
    * Sets the tile cost for a particular tile type.
    *
    * @param {Number} The tile type to set the cost for.
    * @param {Number} The multiplicative cost associated with the given tile.
    **/
    this.setTileCost = function(tileType, cost) {
        costMap[tileType] = cost;
    };

    /**
    * Sets the an additional cost for a particular point.
    * Overrides the cost from setTileCost.
    *
    * @param {Number} x The x value of the point to cost.
    * @param {Number} y The y value of the point to cost.
    * @param {Number} The multiplicative cost associated with the given point.
    **/
    this.setAdditionalPointCost = function(x, y, cost) {
        if (pointsToCost[y] === undefined) {
            pointsToCost[y] = {};
        }
        pointsToCost[y][x] = cost;
    };

    /**
    * Remove the additional cost for a particular point.
    *
    * @param {Number} x The x value of the point to stop costing.
    * @param {Number} y The y value of the point to stop costing.
    **/
    this.removeAdditionalPointCost = function(x, y) {
        if (pointsToCost[y] !== undefined) {
            delete pointsToCost[y][x];
        }
    }

    /**
    * Remove all additional point costs.
    **/
    this.removeAllAdditionalPointCosts = function() {
        pointsToCost = {};
    }

    /**
    * Sets a directional condition on a tile
    *
    * @param {Number} x The x value of the point.
    * @param {Number} y The y value of the point.
    * @param {Array.<String>} allowedDirections A list of all the allowed directions that can access
    * the tile.
    **/
    this.setDirectionalCondition = function(x, y, allowedDirections) {
        if (directionalConditions[y] === undefined) {
            directionalConditions[y] = {};
        }
        directionalConditions[y][x] = allowedDirections;
    };

    /**
    * Remove all directional conditions
    **/
    this.removeAllDirectionalConditions = function() {
        directionalConditions = {};
    };

    /**
    * Sets the number of search iterations per calculation.
    * A lower number provides a slower result, but more practical if you
    * have a large tile-map and don't want to block your thread while
    * finding a path.
    *
    * @param {Number} iterations The number of searches to prefrom per calculate() call.
    **/
    this.setIterationsPerCalculation = function(iterations) {
        iterationsPerCalculation = iterations;
    };

    /**
    * Avoid a particular point on the grid,
    * regardless of whether or not it is an acceptable tile.
    *
    * @param {Number} x The x value of the point to avoid.
    * @param {Number} y The y value of the point to avoid.
    **/
    this.avoidAdditionalPoint = function(x, y) {
        if (pointsToAvoid[y] === undefined) {
            pointsToAvoid[y] = {};
        }
        pointsToAvoid[y][x] = 1;
    };

    /**
    * Stop avoiding a particular point on the grid.
    *
    * @param {Number} x The x value of the point to stop avoiding.
    * @param {Number} y The y value of the point to stop avoiding.
    **/
    this.stopAvoidingAdditionalPoint = function(x, y) {
        if (pointsToAvoid[y] !== undefined) {
            delete pointsToAvoid[y][x];
        }
    };

    /**
    * Enables corner cutting in diagonal movement.
    **/
    this.enableCornerCutting = function() {
        allowCornerCutting = true;
    };

    /**
    * Disables corner cutting in diagonal movement.
    **/
    this.disableCornerCutting = function() {
        allowCornerCutting = false;
    };

    /**
    * Stop avoiding all additional points on the grid.
    **/
    this.stopAvoidingAllAdditionalPoints = function() {
        pointsToAvoid = {};
    };

    /**
    * Find a path.
    *
    * @param {Number} startX The X position of the starting point.
    * @param {Number} startY The Y position of the starting point.
    * @param {Number} endX The X position of the ending point.
    * @param {Number} endY The Y position of the ending point.
    * @param {Function} callback A function that is called when your path
    * is found, or no path is found.
    * @return {Number} A numeric, non-zero value which identifies the created instance. This value can be passed to cancelPath to cancel the path calculation.
    *
    **/
    this.findPath = function(startX, startY, endX, endY, callback) {
        // Wraps the callback for sync vs async logic
        var callbackWrapper = function(result) {
            if (syncEnabled) {
                callback(result);
            } else {
                setTimeout(function() {
                    callback(result);
                });
            }
        }

        // No acceptable tiles were set
        if (acceptableTiles === undefined) {
            throw new Error("You can't set a path without first calling setAcceptableTiles() on EasyStar.");
        }
        // No grid was set
        if (collisionGrid === undefined) {
            throw new Error("You can't set a path without first calling setGrid() on EasyStar.");
        }

        // Start or endpoint outside of scope.
        if (startX < 0 || startY < 0 || endX < 0 || endY < 0 ||
        startX > collisionGrid[0].length-1 || startY > collisionGrid.length-1 ||
        endX > collisionGrid[0].length-1 || endY > collisionGrid.length-1) {
            throw new Error("Your start or end point is outside the scope of your grid.");
        }

        // Start and end are the same tile.
        if (startX===endX && startY===endY) {
            callbackWrapper([]);
            return;
        }

        // End point is not an acceptable tile.
        var endTile = collisionGrid[endY][endX];
        var isAcceptable = false;
        for (var i = 0; i < acceptableTiles.length; i++) {
            if (endTile === acceptableTiles[i]) {
                isAcceptable = true;
                break;
            }
        }

        if (isAcceptable === false) {
            callbackWrapper(null);
            return;
        }

        // Create the instance
        var instance = new Instance();
        instance.openList = new Heap(function(nodeA, nodeB) {
            return nodeA.bestGuessDistance() - nodeB.bestGuessDistance();
        });
        instance.isDoneCalculating = false;
        instance.nodeHash = {};
        instance.startX = startX;
        instance.startY = startY;
        instance.endX = endX;
        instance.endY = endY;
        instance.callback = callbackWrapper;

        instance.openList.push(coordinateToNode(instance, instance.startX,
            instance.startY, null, STRAIGHT_COST));

        var instanceId = nextInstanceId ++;
        instances[instanceId] = instance;
        instanceQueue.push(instanceId);
        return instanceId;
    };

    /**
     * Cancel a path calculation.
     *
     * @param {Number} instanceId The instance ID of the path being calculated
     * @return {Boolean} True if an instance was found and cancelled.
     *
     **/
    this.cancelPath = function(instanceId) {
        if (instanceId in instances) {
            delete instances[instanceId];
            // No need to remove it from instanceQueue
            return true;
        }
        return false;
    };

    /**
    * This method steps through the A* Algorithm in an attempt to
    * find your path(s). It will search 4-8 tiles (depending on diagonals) for every calculation.
    * You can change the number of calculations done in a call by using
    * easystar.setIteratonsPerCalculation().
    **/
    this.calculate = function() {
        if (instanceQueue.length === 0 || collisionGrid === undefined || acceptableTiles === undefined) {
            return;
        }
        for (iterationsSoFar = 0; iterationsSoFar < iterationsPerCalculation; iterationsSoFar++) {
            if (instanceQueue.length === 0) {
                return;
            }

            if (syncEnabled) {
                // If this is a sync instance, we want to make sure that it calculates synchronously.
                iterationsSoFar = 0;
            }

            var instanceId = instanceQueue[0];
            var instance = instances[instanceId];
            if (typeof instance == 'undefined') {
                // This instance was cancelled
                instanceQueue.shift();
                continue;
            }

            // Couldn't find a path.
            if (instance.openList.size() === 0) {
                instance.callback(null);
                delete instances[instanceId];
                instanceQueue.shift();
                continue;
            }

            var searchNode = instance.openList.pop();

            // Handles the case where we have found the destination
            if (instance.endX === searchNode.x && instance.endY === searchNode.y) {
                var path = [];
                path.push({x: searchNode.x, y: searchNode.y});
                var parent = searchNode.parent;
                while (parent!=null) {
                    path.push({x: parent.x, y:parent.y});
                    parent = parent.parent;
                }
                path.reverse();
                var ip = path;
                instance.callback(ip);
                delete instances[instanceId];
                instanceQueue.shift();
                continue;
            }

            searchNode.list = CLOSED_LIST;

            if (searchNode.y > 0) {
                checkAdjacentNode(instance, searchNode,
                    0, -1, STRAIGHT_COST * getTileCost(searchNode.x, searchNode.y-1));
            }
            if (searchNode.x < collisionGrid[0].length-1) {
                checkAdjacentNode(instance, searchNode,
                    1, 0, STRAIGHT_COST * getTileCost(searchNode.x+1, searchNode.y));
            }
            if (searchNode.y < collisionGrid.length-1) {
                checkAdjacentNode(instance, searchNode,
                    0, 1, STRAIGHT_COST * getTileCost(searchNode.x, searchNode.y+1));
            }
            if (searchNode.x > 0) {
                checkAdjacentNode(instance, searchNode,
                    -1, 0, STRAIGHT_COST * getTileCost(searchNode.x-1, searchNode.y));
            }
            if (diagonalsEnabled) {
                if (searchNode.x > 0 && searchNode.y > 0) {

                    if (allowCornerCutting ||
                        (isTileWalkable(collisionGrid, acceptableTiles, searchNode.x, searchNode.y-1, searchNode) &&
                        isTileWalkable(collisionGrid, acceptableTiles, searchNode.x-1, searchNode.y, searchNode))) {

                        checkAdjacentNode(instance, searchNode,
                            -1, -1, DIAGONAL_COST * getTileCost(searchNode.x-1, searchNode.y-1));
                    }
                }
                if (searchNode.x < collisionGrid[0].length-1 && searchNode.y < collisionGrid.length-1) {

                    if (allowCornerCutting ||
                        (isTileWalkable(collisionGrid, acceptableTiles, searchNode.x, searchNode.y+1, searchNode) &&
                        isTileWalkable(collisionGrid, acceptableTiles, searchNode.x+1, searchNode.y, searchNode))) {

                        checkAdjacentNode(instance, searchNode,
                            1, 1, DIAGONAL_COST * getTileCost(searchNode.x+1, searchNode.y+1));
                    }
                }
                if (searchNode.x < collisionGrid[0].length-1 && searchNode.y > 0) {

                    if (allowCornerCutting ||
                        (isTileWalkable(collisionGrid, acceptableTiles, searchNode.x, searchNode.y-1, searchNode) &&
                        isTileWalkable(collisionGrid, acceptableTiles, searchNode.x+1, searchNode.y, searchNode))) {

                        checkAdjacentNode(instance, searchNode,
                            1, -1, DIAGONAL_COST * getTileCost(searchNode.x+1, searchNode.y-1));
                    }
                }
                if (searchNode.x > 0 && searchNode.y < collisionGrid.length-1) {

                    if (allowCornerCutting ||
                        (isTileWalkable(collisionGrid, acceptableTiles, searchNode.x, searchNode.y+1, searchNode) &&
                        isTileWalkable(collisionGrid, acceptableTiles, searchNode.x-1, searchNode.y, searchNode))) {

                        checkAdjacentNode(instance, searchNode,
                            -1, 1, DIAGONAL_COST * getTileCost(searchNode.x-1, searchNode.y+1));
                    }
                }
            }

        }
    };

    // Private methods follow
    var checkAdjacentNode = function(instance, searchNode, x, y, cost) {
        var adjacentCoordinateX = searchNode.x+x;
        var adjacentCoordinateY = searchNode.y+y;

        if ((pointsToAvoid[adjacentCoordinateY] === undefined ||
             pointsToAvoid[adjacentCoordinateY][adjacentCoordinateX] === undefined) &&
            isTileWalkable(collisionGrid, acceptableTiles, adjacentCoordinateX, adjacentCoordinateY, searchNode)) {
            var node = coordinateToNode(instance, adjacentCoordinateX,
                adjacentCoordinateY, searchNode, cost);

            if (node.list === undefined) {
                node.list = OPEN_LIST;
                instance.openList.push(node);
            } else if (searchNode.costSoFar + cost < node.costSoFar) {
                node.costSoFar = searchNode.costSoFar + cost;
                node.parent = searchNode;
                instance.openList.updateItem(node);
            }
        }
    };

    // Helpers
    var isTileWalkable = function(collisionGrid, acceptableTiles, x, y, sourceNode) {
        var directionalCondition = directionalConditions[y] && directionalConditions[y][x];
        if (directionalCondition) {
            var direction = calculateDirection(sourceNode.x - x, sourceNode.y - y)
            var directionIncluded = function () {
                for (var i = 0; i < directionalCondition.length; i++) {
                    if (directionalCondition[i] === direction) return true
                }
                return false
            }
            if (!directionIncluded()) return false
        }
        for (var i = 0; i < acceptableTiles.length; i++) {
            if (collisionGrid[y][x] === acceptableTiles[i]) {
                return true;
            }
        }

        return false;
    };

    /**
     * -1, -1 | 0, -1  | 1, -1
     * -1,  0 | SOURCE | 1,  0
     * -1,  1 | 0,  1  | 1,  1
     */
    var calculateDirection = function (diffX, diffY) {
        if (diffX === 0 && diffY === -1) return EasyStar.TOP
        else if (diffX === 1 && diffY === -1) return EasyStar.TOP_RIGHT
        else if (diffX === 1 && diffY === 0) return EasyStar.RIGHT
        else if (diffX === 1 && diffY === 1) return EasyStar.BOTTOM_RIGHT
        else if (diffX === 0 && diffY === 1) return EasyStar.BOTTOM
        else if (diffX === -1 && diffY === 1) return EasyStar.BOTTOM_LEFT
        else if (diffX === -1 && diffY === 0) return EasyStar.LEFT
        else if (diffX === -1 && diffY === -1) return EasyStar.TOP_LEFT
        throw new Error('These differences are not valid: ' + diffX + ', ' + diffY)
    };

    var getTileCost = function(x, y) {
        return (pointsToCost[y] && pointsToCost[y][x]) || costMap[collisionGrid[y][x]]
    };

    var coordinateToNode = function(instance, x, y, parent, cost) {
        if (instance.nodeHash[y] !== undefined) {
            if (instance.nodeHash[y][x] !== undefined) {
                return instance.nodeHash[y][x];
            }
        } else {
            instance.nodeHash[y] = {};
        }
        var simpleDistanceToTarget = getDistance(x, y, instance.endX, instance.endY);
        if (parent!==null) {
            var costSoFar = parent.costSoFar + cost;
        } else {
            costSoFar = 0;
        }
        var node = new Node(parent,x,y,costSoFar,simpleDistanceToTarget);
        instance.nodeHash[y][x] = node;
        return node;
    };

    var getDistance = function(x1,y1,x2,y2) {
        if (diagonalsEnabled) {
            // Octile distance
            var dx = Math.abs(x1 - x2);
            var dy = Math.abs(y1 - y2);
            if (dx < dy) {
                return DIAGONAL_COST * dx + dy;
            } else {
                return DIAGONAL_COST * dy + dx;
            }
        } else {
            // Manhattan distance
            var dx = Math.abs(x1 - x2);
            var dy = Math.abs(y1 - y2);
            return (dx + dy);
        }
    };
}

EasyStar.TOP = 'TOP'
EasyStar.TOP_RIGHT = 'TOP_RIGHT'
EasyStar.RIGHT = 'RIGHT'
EasyStar.BOTTOM_RIGHT = 'BOTTOM_RIGHT'
EasyStar.BOTTOM = 'BOTTOM'
EasyStar.BOTTOM_LEFT = 'BOTTOM_LEFT'
EasyStar.LEFT = 'LEFT'
EasyStar.TOP_LEFT = 'TOP_LEFT'

},{"./instance":"node_modules/easystarjs/src/instance.js","./node":"node_modules/easystarjs/src/node.js","heap":"node_modules/heap/index.js"}],"src/World.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Cell = _interopRequireDefault(require("./Cell"));

var _Agent = _interopRequireDefault(require("./Agent"));

var _easystarjs = _interopRequireDefault(require("easystarjs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function getDirectionArray(direction) {
  switch (direction) {
    case "n":
      return [_easystarjs.default.BOTTOM];

    case "s":
      return [_easystarjs.default.TOP];

    case "e":
      return [_easystarjs.default.LEFT];

    case "w":
      return [_easystarjs.default.RIGHT];

    case "v":
      return [_easystarjs.default.TOP, _easystarjs.default.BOTTOM];

    case "h":
      return [_easystarjs.default.LEFT, _easystarjs.default.RIGHT];

    default:
      return [_easystarjs.default.TOP, _easystarjs.default.BOTTOM, _easystarjs.default.LEFT, _easystarjs.default.RIGHT];
  }
}

var World = /*#__PURE__*/function () {
  function World(worldmap, mapDirection) {
    var _this = this;

    _classCallCheck(this, World);

    this.state = [];
    this.agents = []; // Setup initial state

    var rows = worldmap.split("\n").filter(function (row) {
      return row.length > 0;
    });
    var directionRows = mapDirection.split("\n").filter(function (row) {
      return row.length > 0;
    }); // Turns the characters from the worldmap into understandable strings

    var types = {
      // Useful stuff
      S: "SPAWN",
      E: "EXIT",
      X: "BUILDING_ENTRANCE",
      b: "BIKE_PATH",
      w: "PEDESTRIAN_PATH",
      a: "ALL_PATH",
      p: "PARKING",
      // Cosmetics
      _: "EMPTY",
      o: "BUILDING"
    };
    this.bikePathfinder = new _easystarjs.default.js();
    this.pedestrianPathfinder = new _easystarjs.default.js(); // Create cells
    // Loop over the 2D array of types, and create a new cell for each type

    var _iterator = _createForOfIteratorHelper(rows.entries()),
        _step;

    try {
      var _loop = function _loop() {
        var _step$value = _slicedToArray(_step.value, 2),
            y = _step$value[0],
            row = _step$value[1];

        var directionRow = _toConsumableArray(directionRows[y]);

        var rowData = _toConsumableArray(row).map(function (c, x) {
          var allowed_direction = directionRow[x];
          var type = types[c];
          var cell = new _Cell.default(_this, type, x, y, allowed_direction);

          _this.bikePathfinder.setDirectionalCondition(x, y, getDirectionArray(allowed_direction));

          _this.pedestrianPathfinder.setDirectionalCondition(x, y, getDirectionArray(allowed_direction));

          return cell;
        });

        _this.state.push(rowData);
      };

      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        _loop();
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    this.bikePathfinder.setGrid(this.state.map(function (row) {
      return row.map(function (cell) {
        return cell.type;
      });
    }));
    this.bikePathfinder.setAcceptableTiles(["SPAWN", "BIKE_PATH", "ALL_PATH", "PARKING", "EXIT"]);
    this.bikePathfinder.setTileCost("ALL_PATH", 2);
    this.bikePathfinder.setTileCost("PARKING", 4);
    this.pedestrianPathfinder.setGrid(this.state.map(function (row) {
      return row.map(function (cell) {
        return cell.type;
      });
    }));
    this.pedestrianPathfinder.setAcceptableTiles(["PEDESTRIAN_PATH", "ALL_PATH", "PARKING", "BUILDING_ENTRANCE"]);
    this.pedestrianPathfinder.setTileCost("ALL_PATH", 2);
    this.pedestrianPathfinder.setTileCost("PARKING", 3);
  }

  _createClass(World, [{
    key: "getCellAtCoordinates",
    value: function getCellAtCoordinates(x, y) {
      return this.state[y][x];
    }
  }, {
    key: "getRandomCellOfType",
    value: function getRandomCellOfType(type) {
      var cells = this.state.flat().filter(function (cell) {
        return cell.type === type;
      });
      return cells[Math.floor(Math.random() * cells.length)];
    } // // Returns all neighbors of a cell
    // getNeighbors(cell) {
    //   const { x, y } = cell;
    //   let neighbors = [];
    //   // Get neighbors in all 4 directions
    //   if (y > 0) {
    //     neighbors.push(this.state[y - 1][x]);
    //   }
    //   if (y < this.state.length - 1) {
    //     neighbors.push(this.state[y + 1][x]);
    //   }
    //   if (x > 0) {
    //     neighbors.push(this.state[y][x - 1]);
    //   }
    //   if (x < this.state[y].length - 1) {
    //     neighbors.push(this.state[y][x + 1]);
    //   }
    //   return neighbors;
    // }
    // Adds a new agent to the world, at a random spawn point

  }, {
    key: "spawnAgent",
    value: function spawnAgent(strategy) {
      // Randomly pick a spawn cell
      var spawn = this.getRandomCellOfType("SPAWN");
      var agent = new _Agent.default(this, "BIKE", spawn, strategy);

      if (spawn.checkAddAgent(agent)) {
        // Add agent of type "BIKE" to this cell
        spawn.addAgent(agent);
        this.agents.push(agent);
      }
    } // Remove agent

  }, {
    key: "removeAgent",
    value: function removeAgent(agent) {
      this.agents = this.agents.filter(function (a) {
        return a !== agent;
      });
      agent.cell.removeAgent(agent);
    } // // Moves agent to a new cell

  }, {
    key: "moveAgent",
    value: function moveAgent(agent, cell) {
      if (cell.checkAddAgent(agent)) {
        agent.cell.removeAgent(agent);
        cell.addAgent(agent);
        agent.cell = cell;
      }
    }
  }, {
    key: "tick",
    value: function tick() {
      this.agents.sort(function () {
        return 0.5 - Math.random();
      });

      var _iterator2 = _createForOfIteratorHelper(this.agents),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var agent = _step2.value;
          agent.act();
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }]);

  return World;
}();

var _default = World;
exports.default = _default;
},{"./Cell":"src/Cell.js","./Agent":"src/Agent.js","easystarjs":"node_modules/easystarjs/src/easystar.js"}],"src/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addTimeToGoal = addTimeToGoal;
exports.addTimeToPark = addTimeToPark;

require("./styles.css");

var _map = _interopRequireWildcard(require("./map"));

var _World = _interopRequireDefault(require("./World"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var squareSize = 32;
var tickdelay = 100;
var spawnspeed = 0.2;
var paused = false; // **********************************
// Controls
// **********************************
// Control play/pause button with "play-pause" id

document.getElementById("play-pause").addEventListener("click", function () {
  if (document.getElementById("play-pause").innerHTML === "Play") {
    document.getElementById("play-pause").innerHTML = "Pause";
    paused = false;
  } else {
    document.getElementById("play-pause").innerHTML = "Play";
    paused = true;
  }
}); // Control tickdelay using range input with id "tickdelay"

document.getElementById("tickdelay").addEventListener("input", function (e) {
  tickdelay = e.target.value;
});
document.getElementById("spawnspeed").addEventListener("input", function (e) {
  spawnspeed = e.target.value;
}); // **********************************
// Read worldmap and create worldData
// **********************************

var world = new _World.default(_map.default, _map.mapDirection); // **********************************
// This is where the simulation loop
// goes later or something
// **********************************

function gameTick() {
  if (!paused) {
    // Spawn new agent sometimes
    if (Math.random() < spawnspeed) {
      world.spawnAgent("TEST_STRATEGY");
    } // Move current agents


    world.tick();
  }

  setTimeout(gameTick, tickdelay);
}

gameTick(); // **********************************
// Draw world state to canvas
// **********************************

var gridWidth = world.state[0].length;
var gridHeight = world.state.length;
var canvasWidth = gridWidth * squareSize;
var canvasHeight = gridHeight * squareSize;
var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
ctx.canvas.width = canvasWidth;
ctx.canvas.height = canvasHeight;

function drawCanvas() {
  var _iterator = _createForOfIteratorHelper(world.state.entries()),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _step$value = _slicedToArray(_step.value, 2),
          y = _step$value[0],
          row = _step$value[1];

      var _iterator2 = _createForOfIteratorHelper(row.entries()),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _step2$value = _slicedToArray(_step2.value, 2),
              x = _step2$value[0],
              cell = _step2$value[1];

          cell.draw(ctx, x, y, squareSize);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  requestAnimationFrame(drawCanvas);
}

requestAnimationFrame(drawCanvas); // **********************************
// Draw graphs for time-to-park and time-to-goal
// **********************************

var timeToParkCanvas = document.getElementById('time-to-park').getContext('2d');
var timeToGoalCanvas = document.getElementById('time-to-goal').getContext('2d');
var timeToParkChart = new Chart(timeToParkCanvas, {
  type: 'line',
  data: {
    datasets: [{
      label: 'Time to park',
      data: [],
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
      pointStyle: "cross"
    }]
  },
  options: {
    animation: false,
    spanGaps: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    },
    datasets: {
      line: {
        pointRadius: 0
      }
    }
  }
});
var timeToGoalChart = new Chart(timeToGoalCanvas, {
  type: 'line',
  data: {
    datasets: [{
      label: 'Time to goal',
      data: [],
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
      pointStyle: "cross"
    }]
  },
  options: {
    animation: false,
    spanGaps: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    },
    datasets: {
      line: {
        pointRadius: 0
      }
    }
  }
});

function addTimeToPark(data) {
  timeToParkChart.data.labels.push(timeToParkChart.data.labels.length);
  timeToParkChart.data.datasets.forEach(function (dataset) {
    dataset.data.push(data);
  });
  timeToParkChart.update();
}

function addTimeToGoal(data) {
  timeToGoalChart.data.labels.push(timeToGoalChart.data.labels.length);
  timeToGoalChart.data.datasets.forEach(function (dataset) {
    dataset.data.push(data);
  });
  timeToGoalChart.update();
}
},{"./styles.css":"src/styles.css","./map":"src/map.js","./World":"src/World.js"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "59650" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","src/index.js"], null)
//# sourceMappingURL=/src.a2b27638.js.map