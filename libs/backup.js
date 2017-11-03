
var async = require('async');
var fs = require('fs-extra');
var path = require("path");

var utils = require('./utils');
var version = require("./version");
var application = require("./application");

var appIds = [];
var appResponses = [];
var versionUrls  = [];
var versionUrlsResponses  = [];


var backup = async function(programmaticKey, done){
  try{
  
    let response = await application.getApplicationList(programmaticKey);

    if(!response.statusCode===200) return(["http didn't return success statusCode", response]);
    if(!response.body) return(["body is empty", response]);

    let list = JSON.parse(response.body);

    let fileName = path.join(__dirname, "applicationList.json");
    await utils.writeFile(fileName,list);

    return Promise.resolve(list);
  }catch(err){
    throw err;
  }
}

module.exports = {
  backup: backup
}