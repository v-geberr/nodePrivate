var utils = require("./utils");
var moment = require("moment");

var getVersion = async function (programmaticKey, appId, versionid) {

  try{
  return await utils.httpRequest({
    method: "GET",
    url: `https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/${appId}/versions/${versionId}/`,
    headers: {
      "Ocp-Apim-Subscription-Key":programmaticKey
    },
    maxAttempts: 5,   
    retryDelay: 500, 
    retryStrategy:  utils.retryStrategy
  });
}catch(err){
  throw err;
}
}

var getVersionList = async function (programmaticKey, appId) {
  
  try{
    
    return await utils.httpRequest({
      method: "GET",
      url: `https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/${appId}/versions/`,
      headers: {
        "Ocp-Apim-Subscription-Key":programmaticKey
      },
      maxAttempts: 5,   
      retryDelay: 500, 
      retryStrategy:  utils.retryStrategy
    });
  }catch(err){
    throw err;
  }
  }

module.exports = {
  getVersion:getVersion,
  getVersionList:getVersionList
}