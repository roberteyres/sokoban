'use strict';

angular.module('myApp.grid', [])

.directive('chart', ['version', function(version) {
  return function(scope, elm, attrs) {
    google.charts.setOnLoadCallback(drawStats);

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
  };
}]);