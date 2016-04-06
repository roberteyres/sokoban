var Util = {
	x1BasedFromIndex: function(index, width) {
		//if width is 3
		//0 should return 1
		//1 should return 2
		//2 should return 3
		//3 should return 1
		//4 should return 2
		//5 should return 3
		return (index % width) + 1;
	},

	y1BasedFromIndex: function(index, width) {
		//if width is 3
		//0 should return 1
		//1 should return 1
		//2 should return 1
		//3 should return 2
		//4 should return 2
		//5 should return 2
		return Math.floor(index / width) + 1;
	},
	
	indexFromCartesian1Based: function(xCoordinate1Based, yCoordinate1Based, width) {
		//0,0 should return ERROR - our coordinates are 1-based!
		//1,1 should return 0
		//5,1 should return 4
		//4,10 should return 
		
		//multiply yCoordinate1Based -1 by width of grid
		//add xCoordinate1Based -1
		
		if (xCoordinate1Based < 1 || xCoordinate1Based > width) {
			throw "x Coordinate out of range in indexFromCartesion1Based => " + xCoordinate1Based;
		} else if (yCoordinate1Based < 1) { 
			throw "y Coordinate out of range in indexFromCartesion1Based => " + yCoordinate1Based;
		} else {
			return ((yCoordinate1Based - 1) * width) + (xCoordinate1Based - 1);
		}
	}
};

module.exports = Util;
