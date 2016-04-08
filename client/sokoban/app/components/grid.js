/* global angular */

function initialiseService($http) {

  var mapRelPath = '../../../../../';

	function loadSession(games, user) {
		var gameData = store.get(user);
				
		if(gameData){
			games.forEach(function(game) {
				var data = gameData[game.key];
				
				if(data){
					game.complete = data.complete;
					game.grid.moveCount = data.grid.moveCount;
				}
			});
		}
	}

  function loadGamesMap($http, mapName, callback) {
    $http({
      url: mapRelPath + mapName + ".txt",
      method: 'GET',
      data: '',
      headers: {
        "Content-Type": "text/plain"
      }
    }).success(function(response) {
      callback(parseMapData(mapName, response));
    }).error(function(error) {
      callback(error);
    });
  }

  function parseMapData(name, textData) {
    var gameLines = textData.split('\n');
    var games = [];
    var i = 1;
    var currentGame = {
      name: "Level " + i++,
      rows: []
    };

    gameLines.forEach(function(lineText) {
      if (lineText.length == 0) {
        currentGame.load = function(reload) {
          if(!reload && this.grid) return this;
          return createGridFromGameMap(this);
        };
		currentGame.key = i;
        
        games.push(currentGame);
        currentGame = {
          name: "Level " + i++,
          rows: []
        };
      }
      else {
        currentGame.rows.push(lineText);
      }
    });

    return games;
  }

  function createGrid(size) {
    size = size || 10;

    var game = {
      name: "Random Game",
      rows: []
    };

    var state = {};

    for (var r = 0; r < size; r++) {
      var row = "";
      for (var c = 0; c < size; c++) {
        row += getSymbolFromCellType(getCellType(c, r, size, state));
      }
      game.rows.push(row);
    }
    
    game.load = function(reload) {
      if(reload) return createGridFromGameMap(this);
      return this;
    };

    return createGridFromGameMap(game);
  }


  function createGridFromGameMap(gameMap) {

    gameMap.grid = [];
    
    gameMap.moveMan = function(ev) {
      var man = this.grid.findMan();
      var adj = man.adjacent();
      var targ;
      
      switch(ev.keyCode) {
        case 37:
          targ = adj.left;
          break;
        case 39:
          targ = adj.right;
          break;
        case 38:
          targ = adj.up;
          break;
        case 40:
          targ = adj.down;
          break;
      }
      
      onCellClicked(this.grid, targ);
    };
    
    var grid = gameMap.grid;
    
    grid.parent = gameMap;
    grid.storage = [];
    grid.moveCount = 0;
    
    grid.findMan = function() {
      var man;
      
      this.forEachCell(function(cell) {
          if(cell.cellType == "man") {
            man = cell;
            return;
          }
      });
      
      return man;
    };

    grid.forEachRow = function(callback) {
      for (var r = 0; r < this.length; r++) {
        var row = this[r];
        callback(row);
      }
    };

    grid.forEachCell = function(callback) {
      for (var r = 0; r < this.length; r++) {
        var row = this[r];
        for (var c = 0; c < row.cells.length; c++) {
          callback(row.cells[c]);
        }
      }
    };
    
    grid.numberOfCrateInStorage = function() {
      var t = 0;
      
      for(var i = 0; i < grid.storage.length; i++) {
        var cell = grid.storage[i];
        if(cell.cellType == "crate") {
          t++;  
        }
      }
      
      return t;
    };

    grid.isComplete = function() {
      return this.numberOfCrateInStorage() == grid.storage.length;
    };

    var gridSize = gameMap.rows.length;
    var cellWidth = 70;

    for (var r = 0; r < gridSize; r++) {

      var rowData = gameMap.rows[r];

      var row = {
        cells: [],
        data: rowData
      };

      row.forEachCell = function(callback) {
        for (var c = 0; c < this.cells.length; c++) {
          callback(this.cells[c]);
        }
      };

      grid.push(row);

      for (var c = 0; c < rowData.length; c++) {
        
        var ct = getCellTypeFromSymbol(rowData[c]);

        var cellObj = {
          y: r,
          x: c,
          parent: row,
          width: cellWidth,
          height: cellWidth,
          cellType: ct,
          fixedCellType: ct == "storage" ? ct : "",
          click: function() {
            grid.forEachCell(function(cur) {
              cur.selected = false;
            });
            this.selected = true;
            onCellClicked(grid, this);
          },
          offsetCell: function(x0, y0) {
            var y1 = (this.y + y0);
            var x1 = (this.x + x0);
            if (x1 < 0 || y1 < 0 || y1 >= gridSize || x1 >= gameMap.rows[y1].length) return undefined;
            return grid[y1].cells[x1];
          },
          adjacent: function() {
            var adj = {
              left: this.offsetCell(-1, 0),
              right: this.offsetCell(1, 0),
              up: this.offsetCell(0, -1),
              down: this.offsetCell(0, 1),
              upleft: this.offsetCell(-1, -1),
              upright: this.offsetCell(1, -1),
              downleft: this.offsetCell(-1, 1),
              downright: this.offsetCell(1, 1),
              find: function(predicate) {
                for (var i = 0; i < this.all.length; i++) {
                  if (predicate(this.all[i])) return this.all[i];
                }
              }

            };

            adj.all = [];

            if (adj.up) adj.all.push(adj.up);
            if (adj.right) adj.all.push(adj.right);
            if (adj.down) adj.all.push(adj.down);
            if (adj.left) adj.all.push(adj.left);
            if (adj.upleft) adj.all.push(adj.upleft);
            if (adj.upright) adj.all.push(adj.upright);
            if (adj.downleft) adj.all.push(adj.downleft);
            if (adj.downright) adj.all.push(adj.downright);

            return adj;
          },
          swapType: function(otherCell) {
            var tt = this.cellType;
            this.cellType = otherCell.cellType;
            otherCell.cellType = (tt == "" ? otherCell.fixedCellType : tt);
          },
          overlay: function(otherCell) {
            this.cellType = otherCell.cellType;
            otherCell.cellType = otherCell.fixedCellType;
          },
          pushCell: function(pusher) {
            var x = pusher.x - this.x;
            var y = pusher.y - this.y;
            var targ = this.offsetCell(-x, -y);

            if (targ && (targ.cellType == "" || targ.cellType == "storage")) {
              var tct = targ.cellType;
              targ.cellType = this.cellType;
              this.cellType = pusher.cellType;
              pusher.cellType = pusher.fixedCellType;
              if (tct == "storage") {
                targ.complete = true;
              }
              return true;
            }

            return false;
          }
        };
        
        if(cellObj.cellType == "storage") {
          grid.storage.push(cellObj);
        }
        
        row.cells.push(cellObj);

      }
    }
    
    return gameMap;
  }
  
  function moveTo(grid, cell) {
    var man = grid.findMan();
    
    if(!man) return;
    
    var diff = { x: cell.x - man.x, y: cell.y - man.y };
    
    if(diff.x !== 0 && diff.y !== 0) return;
    
    if(diff.x !== 0) {
      diff.xd = diff.x > 0 ? 1 : -1;
      while(man.x !== cell.x) {
        if(!onCellClicked(grid, man.offsetCell(diff.xd, 0))) {
          break;
        }
        man = grid.findMan();
      }
    }
    
    if(diff.y !== 0) {
      diff.yd = diff.y > 0 ? 1 : -1;
      while(man.y !== cell.y) {
        if(!onCellClicked(grid, man.offsetCell(0, diff.yd))) {
          break;
        }
        man = grid.findMan();
      }
    }
  }

  function onCellClicked(grid, cell) {

    // find the player in an adjacent cell
    // check what's in this cell:
    // * if nothing, move the man
    // * if crate, push the crate in the same direction as long as there is a space for the crate
    // * else do nothing

    if(!cell) return false;
    
    var adjacent = cell.adjacent();

    var player = adjacent.find(function(c) {
      return c.cellType == "man";
    });

    if (!player) return moveTo(grid, cell);

    if (cell.cellType == "") {
      grid.moveCount++;
      cell.swapType(player);
      return true;
    }
    if (cell.cellType == "crate") {
      
      if(!cell.pushCell(player)) return false;
      
      grid.moveCount++;

      if (!grid.parent.complete && grid.isComplete()) {
        grid.parent.complete = true;
        if (grid.onComplete) {
          grid.onComplete(player);
        }
      }

      return true;
    }
    if (cell.cellType == "storage") {
      grid.moveCount++;
      cell.overlay(player);
      return true;
    }
    return false;
  }


  function getSymbolFromCellType(symbol) {
    switch (symbol) {
      case "wall":
        return "#";
      case "storage":
        return ".";
      case "man":
        return "@";
      case "crate":
        return "o";
      default:
        return " ";
    }
  }

  function getCellTypeFromSymbol(symbol) {
    switch (symbol) {
      case "#":
        return "wall";
      case ".":
        return "storage";
      case "@":
        return "man";
      case "o":
        return "crate";
      default:
        return "";
    }
  }

  function getCellType(x, y, size, state) {
    var r = Math.random();
    var mid = Math.round(size / 2);

    function rndPoint() {
      return {
        x: 1 + Math.round(Math.random() * size - 1),
        y: 1 + Math.round(Math.random() * size - 1)
      }
    }

    function setupState() {
      state.crates = [];
      state.stores = [];
      for (var n = 0; n < size; n++) {
        state.crates.push(rndPoint());
        state.stores.push(rndPoint());
      }
      state.setup = true;
    }

    if (!(state.setup == true)) {
      setupState();
    }

    if (x == mid && y == mid) {
      return "man";
    }

    if (x == 0 || y == 0 || x == size - 1 || y == size - 1) return "wall";

    if (r < 0.05) {
      return "wall";
    }
    if (r < 0.2) {
      return "crate";
    }
    if (r < 0.3) {
      return "storage";
    }
    return "";
  }
  
  return {
    create: createGrid,
    loadGames: function(mapName, callback) {
      loadGamesMap($http, mapName, callback);
    }
  };
}

angular.module('myApp.grid', []).factory('myApp.grid.factory', ['$http', initialiseService]);

// exports.create = createGrid;