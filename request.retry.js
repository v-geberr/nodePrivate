var request = require("requestretry");
var async = require('async');
var fs = require('fs');
var moment = require('moment');

var appIds = [];


var myRequestAppList = function(cb) {

  var retryStrategy = function (err, response, body){
    let shouldRetry = err || (response.statusCode === 429);
    //console.log("shouldRetry " + shouldRetry);
    return shouldRetry;
  }

  let requestOptions = {
    method:"GET",
    url: "https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/",
    headers: {
      "Ocp-Apim-Subscription-Key":"e237d6bc86cd4562bf67b09dff44d2e6"
    },
    maxAttempts: 5,   
    retryDelay: 5000, 
    retryStrategy:  retryStrategy
  };

  request(requestOptions, function(err, response, body){
    // this callback will only be called when the request succeeded or after maxAttempts or on error 
    if (response && response.statusCode === 200){
      let json = JSON.parse(response.body);
      if(Array.isArray(json) && json[0].hasOwnProperty('id')) {
      //console.log('The number of request attempts: ' + response.attempts);
        var urls = [];
        appIds = json.map(x => x.id);
        appIds.forEach(id => {
          urls.push("https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/" + id);
          urls.push("https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/" + id + "/versions");
          urls.push("https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/" + id + "/settings");
          urls.push("https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/" + id + "/endpoints");

        });
      }
    }
    cb(urls);
  });
}


var myRequestApp = function(url, i, cb) {
  
    var retryStrategy = function (err, response, body){
      let shouldRetry = err || (response.statusCode === 429);
      //console.log("shouldRetry " + shouldRetry);
      return shouldRetry;
    }
  
    let requestOptions = {
      method:"GET",
      url: url,
      headers: {
        "Ocp-Apim-Subscription-Key":"e237d6bc86cd4562bf67b09dff44d2e6"
      },
      maxAttempts: 5,   
      retryDelay: 5000, 
      retryStrategy:  retryStrategy
    };
  
    request(requestOptions, function(err, response, body){
      // this callback will only be called when the request succeeded or after maxAttempts or on error 
      if (response && response.statusCode === 200){
        console.log(response.request.href + " success");
        let json = JSON.parse(response.body);
        cb({url: response.request.href, body: json});
      } else {
        console.log(response.request.href + " fail");
        cb({url: response.request.href, status: response.statusCode});
      }
    });
  }

let appInfos = [];

let i = 0;
let len = 0;

var myRequestApp = function (eachUrl, done) {
  var now = new moment();
  console.log(now.format("HH:mm:ss"));
  setTimeout(function () {
    let requestOptions = {
      method:"GET",
      url: eachUrl,
      headers: {
        "Ocp-Apim-Subscription-Key":"e237d6bc86cd4562bf67b09dff44d2e6"
      }
    };
    request(requestOptions, function(error, response, body) { 
      let json = JSON.parse(body);
      appInfos.push({url: response.request.href, status: response.statusCode, body: json});
      done();
    });
  }, 5000);
}

var myFile = function(){
  fs.writeFile("timed.apps.json",JSON.stringify(appInfos),"utf-8", function(err, result){
    return;
  });
}

myRequestAppList( (urls) => {
  async.eachSeries(urls, myRequestApp, myFile);
});




