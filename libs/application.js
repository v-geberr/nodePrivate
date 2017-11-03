var utils = require("./utils");
var moment = require("moment");

var getApplicationList = async function (programmaticKey, done) {

  try{

  return await utils.httpRequest({
    method: "GET",
    url: `https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps?take=500`,
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

var getApplication = async function (programmaticKey, appId) {
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
  getApplicationList:getApplicationList,
  getApplication:getApplication
}