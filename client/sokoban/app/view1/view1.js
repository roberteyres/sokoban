'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', function($scope) {
  var games = loadGames();
  $scope.games = games;
  
  $scope.grid = loadGrid(games[0].text);
  
  $scope.success = "attempting to set focus";
  
  
  function readTextFile(file) {
      var rawFile = new XMLHttpRequest();
      var allText;
      rawFile.open("GET", file, false);
      rawFile.onreadystatechange = function () {
          if(rawFile.readyState === 4) {
              if(rawFile.status === 200 || rawFile.status == 0) {
                  allText = rawFile.responseText;
              }
          }
      }
      rawFile.send(null);
      return allText;
  }
  
  function loadGames(filename) {
    filename = filename || "../../../../../sokoban-levels-plus.txt";
    var gamesText = readTextFile(filename);
    var gameLines = gamesText.split('\n');
    var games = [];
    var game ="";
    gameLines.forEach(function(lineText) {
      game += lineText + '\n';
      if (lineText.length == 0) {
        games.push({
          text:game, 
          name:games.length,
          load: function() {
            $scope.grid = loadGrid(this.text);
          }
        });
        game = "";
      }
    });
    return games;
  }
  
  function loadGrid(textGrid) {
    var gridLines = textGrid.split('\n');
    var gridWidth;
    var gridHeight = gridLines.length;
    var numStorages = 0; //not really used at the moment - we're assuming this is always the same as numCrates
    var numCrates = 0;
    var numCratesInStorage = 0;
    var manPosX = 0;
    var manPosY = 0;

    var grid = [];
    grid.keypressed = function() {
      //really don't understand why I can't get this to work when key pressed on grid; - perhaps these events only trigger on input fields?
      //nor why I can't listen for it within cell
      $scope.success = "keypressed (" + event.keyCode + ") - trapped in grid object";
      var y = getSimulatedYClick(manPosY,event.keyCode);
      var x = getSimulatedXClick(manPosX,event.keyCode);
      grid[y].cells[x].click();
    };
    
    var cellWidth = 70;
    
    for(var r = 0; r < gridHeight; r++) {
      gridWidth = gridWidth >= gridLines[r].length ? gridWidth : gridLines[r].length;
      /*is it better to do something like 
      gridWidth = Math.Max(gridWidth, gridLines[r].length);
      ? */
      var row = {
        cells : []  
      };
      
      grid.push(row);
      
      for(var c = 0; c < gridLines[r].length; c++) {
        
        row.cells.push({
          gridTarget: numCrates,
          gridSuccessSoFar: numCratesInStorage,
          y: r,
          x: c,
          width: cellWidth,
          height: cellWidth,
          cellType: convertCellType(gridLines[r].substring(c,c+1)),
          keyup: function() {
            $scope.success = "key pressed";
          },
          click: function() {
            onCellClicked(grid, this);
            if (numCrates == numCratesInStorage) {
              $scope.success = "Complete.  Well Done!";
            }
          },
          keypress: function() {
            alert("keypressed");
          },
          adjacent: function(x0, y0) {
            return grid[this.y + y0].cells[this.x+ x0];
          },
          loseMan: function() {
            if (this.cellType == "man") {
              this.cellType = "";
            } else if (this.cellType =="manANDstorage") {
              this.cellType = "storage";
            }
          },
          addMan: function() {
            if (this.cellType == "") {
              this.cellType = "man";
            } else if (this.cellType == "storage") {
              this.cellType = "manANDstorage";
            }
            manPosX = this.x;
            manPosY = this.y;
          },
          addCrate: function() {
            if (this.cellType =="") {
              this.cellType = "crate";
            } else if (this.cellType == "storage") {
              this.cellType = "crateANDstorage";
              numCratesInStorage++;
              
            }
          },
          loseCrate: function() {
            if (this.cellType == "crate") {
              this.cellType = "";
            } else if (this.cellType == "crateANDstorage") {
              this.cellType = "storage";
              numCratesInStorage--;
            }
          }
        });
        if (row.cells[c].cellType == "storage") numStorages ++;
        if (row.cells[c].cellType == "crate") numCrates ++;
        if (row.cells[c].cellType == "man") {
          manPosX = row.cells[c].x;
          manPosY = row.cells[c].y;
        }
      }
    }
    
    $scope.success = "";
    return grid;
  }
  
  function onCellClicked(grid, cell) {
    // body...
    // check four adjacent cells for man
    
    var left = cell.adjacent(-1, 0);
    var right = cell.adjacent(1, 0);
    left.opposite = right;
    right.opposite = left;
    var up = cell.adjacent(0, -1);
    var down = cell.adjacent(0, 1);
    up.opposite = down;
    down.opposite = up;
    [left,right,up,down].forEach(function(direction) {
      if (direction.opposite.cellType == "man" || direction.opposite.cellType == "manANDstorage") {
      
        if(cell.cellType == "" || cell.cellType == "storage") {
          direction.opposite.loseMan();
          cell.addMan();
          return;
        }
        
        if((cell.cellType == "crate" || cell.cellType == "crateANDstorage") && (direction.cellType == "" || direction.cellType =="storage")) {
          direction.addCrate();
          direction.opposite.loseMan();
          cell.loseCrate();
          cell.addMan();
          return;
        }
      }
    });
  }
  
  function convertCellType(inputType) {
    //# = wall
    //o = crate
    //. = storage
    //@ = man
    var dictTrans = {
      "#": "wall",
      "o": "crate",
      ".": "storage",
      "@": "man",
      " ": ""
    };
    
    return dictTrans[inputType];
  }

  function getSimulatedYClick(manY, clickCode) {
    if (clickCode == 37 || clickCode == 39) return manY;
    if (clickCode == 38 && manY>0) return manY-1;
    if (clickCode == 40) return manY+1; //should really check that there's somewhere to click in that direction; but as long as the map is surrounded by wall, all will be ok
  }

  function getSimulatedXClick(manX, clickCode) {
    if (clickCode == 38 || clickCode == 40) return manX;
    if (clickCode == 37 && manX>0) return manX-1;
    if (clickCode == 39) return manX+1; //should really check that there's somewhere to click in that direction; but as long as the map is surrounded by wall, all will be ok
  }
}]);