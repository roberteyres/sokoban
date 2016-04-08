'use strict';

/* global angular */
/* global google */

angular.module('myApp.view2', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view2', {
    templateUrl: 'view2/view2.html',
    controller: 'View2Ctrl'
  });
}])

.controller('View2Ctrl', ['$scope', 'myApp.grid.factory', function($scope, gridFactory) {

  $scope.status = { text: "Welcome - choose a level", gamesCompleted: 0 };
  
  gridFactory.loadGames("sokoban-levels-plus", function(games) {
    $scope.games = games;
    
    $scope.loadGame = function(game, reload){
      $scope.currentGame = game.load(reload);
      $scope.currentGame.grid.onComplete = notifyComplete;
      $scope.status.text = ($scope.currentGame.complete ? "" : "Prepare to lose");
    };
  });
  
  $scope.currentGame = gridFactory.create(10);
  $scope.currentGame.grid.onComplete = notifyComplete;
  
  function notifyComplete(player) {
    $scope.status.text = "Yee ha...you've completed " + $scope.currentGame.name + ". Please select another level.";
    $scope.status.gamesCompleted++;
  };
  
  // google.charts.setOnLoadCallback(drawStats);

	function drawStats() {
	
		var data = [];
		
		var tableData = google.visualization.arrayToDataTable(data);

		var options = {
			title: '',
			hAxis: {title: 'x'},
			vAxis: {title: 'y'}
		};
		
		var chart = new google.visualization.BarChart(document.getElementById('stats-chart'));
		
		chart.draw(tableData, options);
	}

}]);