/*

1) change programmaticKey to your key

2) process:

    a) get all apps as appUrls

    b) for each app, build array of urls (settings, endpoints, versions, info)

    c) call each url

    d) put responses back into appUrls

    e) for each response, get version export url

    f) call each url

    g) push version responses back ito appUrls


*/

const request = require("requestretry");
const async = require('async');
const fs = require('fs-extra');
const moment = require('moment');
const path = require("path");

// Change to your programmatic key
//const programmaticKey = "PROGRAMMATIC KEY";
const programmaticKey = "fb3488ba06614b4985c1baa7a0af0376";

// time delay between requests
const delayMS = 500;

// retry recount
const retry = 5;

// collections for urls and responses
//var appResponses = [];
var versionUrls  = [];
var versionUrlsResponses  = [];

// retry reqeust if error or 429 received
var retryStrategy = function (err, response, body){
  let shouldRetry = err || (response.statusCode === 429);
  if(shouldRetry) console.log("retry");
  return shouldRetry;
}

var myAppList = function(done) {

  let requestOptions = {
    method:"GET",
    url: "https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps?take=500",
    headers: {
      "Ocp-Apim-Subscription-Key":programmaticKey
    },
    maxAttempts: retry,   
    retryDelay: delayMS, 
    retryStrategy:  retryStrategy
  };

  request(requestOptions, function(err, response, body){
    if(err || response.statusCode != 200)done();
    done({apps:JSON.parse(response.body)});
  });
}

var appListInfos = (appList, done) => {
  var urls = [];

  appList.apps.forEach(app => {

    console.log("app " + app.name);

    urls.push({name: app.name,appId:app.id, "Ocp-Apim-Subscription-Key":programmaticKey, route: "appInfo",url: ("https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/" + app.id)});
    urls.push({name: app.name,appId:app.id, "Ocp-Apim-Subscription-Key":programmaticKey, route: "versions",url: ("https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/" + app.id + "/versions?take=500")});
    urls.push({name: app.name,appId:app.id, "Ocp-Apim-Subscription-Key":programmaticKey, route: "settings",url: ("https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/" + app.id + "/settings")});
    urls.push({name: app.name,appId:app.id, "Ocp-Apim-Subscription-Key":programmaticKey, route: "endpoints",url: ("https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/" + app.id + "/endpoints")});
  });
  done(urls);
}

// get url request info
var myRequestApp = function (eachUrlObj, done) {

  console.log("request app " + eachUrlObj.url + ' ' + new moment().format("HH:mm:ss"));

    let requestOptions = {
      method:"GET",
      url: eachUrlObj.url,
      headers: {
        "Ocp-Apim-Subscription-Key":programmaticKey
      },
      maxAttempts: retry,   
      retryDelay: delayMS, 
      retryStrategy:  retryStrategy
    };
    request(requestOptions, function(error, response, body) { 

      if(error || response.statusCode != 200)done();
      console.log("response app " + response.request.href + " " + response.statusCode);

      let json = JSON.parse(body);
      let route = response.request.href.substr(response.request.href.lastIndexOf('/') + 1).replace('?take=500','');

      let myresponse = {
        appId: eachUrlObj.appId,
        route: route,
        name: eachUrlObj.name,
        url: response.request.href, 
        status: response.statusCode, 
        body: json
      };

      // push response onto list
      //appResponses.push(myresponse);
      
      // put response back into object
      eachUrlObj[route] = {
        response: myresponse, 
        status: response.statusCode};

      done();
    });

}

// get version info
var myRequestAppVersions = function (eachUrlObj, done) {

  console.log("request version " + eachUrlObj.version + ' ' + new moment().format("HH:mm:ss"));

      let requestOptions = {
        method:"GET",
        url: eachUrlObj.url,
        headers: {
          "Ocp-Apim-Subscription-Key":eachUrlObj["Ocp-Apim-Subscription-Key"]
        },
        maxAttempts: retry,   
        retryDelay: delayMS, 
        retryStrategy:  retryStrategy
      };
      request(requestOptions, function(error, response, body) { 
  
        console.log("response version " + response.request.href + " " + response.statusCode);
  
        let json = JSON.parse(body);
        let route = response.request.href.substr(response.request.href.lastIndexOf('/') + 1).replace('?take=500','');
  
        let myresponse = {
          appId: eachUrlObj.appId,
          route: route,
          name: json.name,
          url: response.request.href, 
          status: response.statusCode, 
          body: json
        };

        // put response back into object
        eachUrlObj.response = json;
        eachUrlObj.responseStatus = response.statusCode;
        done();
      });

  }

let getVersionUrlsForThisApp = (progKey, appName, appId, versionList,done) => {
  let versionUrls = []
  versionList.forEach(version => {
    versionUrls.push({"Ocp-Apim-Subscription-Key":progKey,name: appName, id: appId, version:version.version,info:JSON.parse(JSON.stringify(version)), url: `https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/${appId}/versions/${version.version}/export`});
  });
  done(versionUrls);
}

let getVersionInfos = (appUrls, versionUrls,done) => {
  async.eachSeries(versionUrls, myRequestAppVersions, (versionsResponse) => {
    done(versionsResponse);
  });
}

var fixAppList = (appList, children) => {

  appList.forEach(app => {
    var properties = children.filter(x => x.appId === app.id);
    var bodies = properties.map(x => {
      let info = {};
      if (x.route === "appInfo"){
        info = { route: "appInfo", values: x[x.appId].response.body};
      } else {
        info = { route: x.route, values: x[x.route].response.body};
      }
      return info;
    });
    app.properties = bodies;
  });
}

var fixVersionList = (appList, children) => {
  appList.forEach(app => {
    var versionsList = children.filter(x => x.id === app.id);
    var bodies = versionsList.map(x => x.response );
    app.properties.push({ route: "versionExports", values: bodies});
  });

}

// main function
myAppList((appUrls) => {

  //appUrls.programmaticKey = programmaticKey;

  appListInfos(appUrls,(appInfoUrls) => {

    // reqeuest all app infos, when all returned and done, then proceed
    async.eachSeries(appInfoUrls, myRequestApp, (response) => {
    
        // *** includes step d
        var appChildrenRoutes = JSON.parse(JSON.stringify(appInfoUrls));


        var appVersionInfoResponses = appChildrenRoutes.filter(x => x.route === "versions");

        //delete appUrls.urls;
        fixAppList(appUrls.apps, appChildrenRoutes);


        let versionUrls = [];
        appVersionInfoResponses.forEach(app => {
            let listOfVersionsForThisApp = app.versions.response.body;
            getVersionUrlsForThisApp(programmaticKey, app.name, app.appId,listOfVersionsForThisApp, (appVersionUrls) => {
              versionUrls.push(...appVersionUrls);
            });
        });

        // *** includes step f
        // get version info
        getVersionInfos(appUrls, versionUrls,(versionsResponse)=>{
    
          // *** includes step g
          fixVersionList(appUrls.apps, versionUrls);
    
          fs.writeFile(path.join(__dirname,"backup.json"), JSON.stringify(appUrls), "utf-8")
          .then(() => {
            console.log("done");
          }).catch(err => {console.log(err);});
          
        });


      });
      });
  });






