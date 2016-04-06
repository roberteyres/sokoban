var Util = require('./Util.js');

function Grid(width,height) {
	this.width = width;
	this.height = height;
	this.grid = "";
}
		
Grid.prototype = {
	constructor: Grid,
	
	loadGridFromString: function(gridCode) {
        var thisCode;
        for (var i=0; i<gridCode.length; i++) {
            thisCode = gridCode.substring(i,i+1);
	        if (thisCode == "\n") {
	            console.log("found carriage return at " + i);
	            this.setCellCodeByIndex(i, "~");
	        } else {
	            this.setCellCodeByIndex(i, thisCode);
	        }
	    }
	},
	
	getCellCodeByIndex: function(index) {
	    return this.grid.substring(index,index+1);
	},
	
	setCellCodeByIndex: function(index, code) {
	    this.grid = this.grid.substring(0,index) + code + this.grid.substring(index+1);
	},
	
	getCellCode: function(x1Based,y1Based) {
		var indexToGet = Util.ndexFromCartesian1Based(x1Based,y1Based,this.width);
		return this.grid.substring(indexToGet,indexToGet+1);
	},
	
	setCellCode: function(x1Based,y1Based,code) {
		var indexToSet = Util.indexFromCartesian1Based(x1Based,y1Based,this.width);
		this.grid = this.grid.substring(0,indexToSet) + code + this.grid.substring(indexToSet+1);
	},
	
	getFirstCellOfNeighbourhood: function(index,offset) {
		//0,0 => new Cell(1,1) //Cell works on 1Based coords
		//0,1 => new Cell(2,2) //The offset of 1 in both axes
		//1,1 => new Cell(4,2)
		//2,1 => new Cell(6,2)
		var x = (((2*index)+offset)%this.width)+1;
		var y = (Math.floor(((2*index)+offset)/width)*2)+offset+1;
		return new Cell(x,y, this.getCellCode(x,y));
	},
	
	goRight: function(startCell) {
		var x, y;
		x = startCell.x + 1;
		y = startCell.y;
		if (x > this.width)	x = 1;
		return new Cell(x,y, this.getCellCode(x,y));
	},
	
	goDown: function(startCell) {
		var x, y;
		x = startCell.x;
		y = startCell.y + 1;
		if (y > this.height) y = 1;
		return new Cell(x,y, this.getCellCode(x,y));
	},
	
	pushNeighbourhoodIntoGrid: function(neighbourhood) {
		neighbourhood.cells.forEach(function(r) {
			this.setCellCode(r.x,r.y,r.code);
		}, this);
		
	}

};

module.exports = Grid;
