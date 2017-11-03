var fs = require('fs-extra');
var request = require("requestretry");

var retryStrategy = function (err, response, body){
  let shouldRetry = err || (response.statusCode === 429);
  return shouldRetry;
}

var writeFile = async function(fileName,data){
  try{
  return await fs.writeFile(fileName,data,"utf-8");
  }catch(err){
    throw err;
  }
}

var httpRequest = async function(options){
  try{
  return await request(options);
  }catch(err){
    throw(err);
  }
};

module.exports = {
  retryStrategy: retryStrategy,
  writeFile: writeFile,
  httpRequest: httpRequest
}