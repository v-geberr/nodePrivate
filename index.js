var backup = require("./libs/backup");
var utils = require("./libs/utils");
var path = require('path');
//describe("backup", function() {
//  it("gets backup successfully", function() {

    let programmatic_key = "fb3488ba06614b4985c1baa7a0af0376";

    try{
      let list = backup.backup(programmatic_key);
      console.log(list);
    }catch(err){
      console.log(err);
    }
//  });
//});

