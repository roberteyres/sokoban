var Grid = require("./Grid.js");
var a = new Grid(18,18);
var fs = require('fs');
fs.readFile('./onegrid.txt', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  console.log(data);
  a.loadGridFromString(data);
});
console.log(a.getCellCodeByIndex(2));
var Util = require('./Util.js');
console.log(Util.x1BasedFromIndex(5,2));
