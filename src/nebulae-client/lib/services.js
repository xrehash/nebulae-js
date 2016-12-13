var networkCall;

(function (networkCall) {
  var get = function get(url) {
    //Return a new promise.
    return new Promise(function (resolve, reject) {
      //Do the usual XHR stuff
      var req = new XMLHttpRequest();
      req.open('GET', url);

      req.onload = function () {
        /*This is called even on 404 etc
        so check the status */
        if (req.status == 200) {
          //Resolve the promise with the response text
          resolve(req.response);
        } else {
          /*Otherwise reject with the status text
          which will hopefully be a meaningful error */
          reject(Error(req.statusText));
        }
      };

      //Handle network errors
      req.onerror = function () {
        reject(Error("Network Error"));
      };

      //Make the request
      req.send();
    });
  };

  var post = function post(url, data) {
    // Return a new promise.
    return new Promise(function (resolve, reject) {
      // Do the usual XHR stuff
      var req = new XMLHttpRequest();
      req.open('POST', url);
      req.setRequestHeader("Content-Type", "application/json");
      req.onload = function () {
        // This is called even on 404 etc
        // so check the status
        console.log(req);
        if (req.status >= 200 && req.status < 300) {
          // Resolve the promise with the response text
          resolve(req.response);
        } else {
          // Otherwise reject with the status text
          // which will hopefully be a meaningful error
          reject(Error(req.statusText));
        }
      };

      // Handle network errors
      req.onerror = function () {
        reject(Error("Network Error"));
      };

      // Make the request
      req.send(data);
    });
  }

  var GetResourceTypes = (function () {
    function GetResourceTypes() {
      var queryURL = "https://couchdb-076880.smileupps.com/nebulae_resource_types/_design/resource_type_names/_view/names";
      return get(queryURL);
    }
    return GetResourceTypes;
  }());
  networkCall.GetResourceTypes = GetResourceTypes;

  var SaveResourceType = (function () {
    function SaveResourceType(data) {
      var docURL = "https://couchdb-076880.smileupps.com/nebulae_resource_types";
      return post(docURL, JSON.stringify(data));
    }
    return SaveResourceType;
  }());
  networkCall.SaveResourceType = SaveResourceType;

})(networkCall || (networkCall = {}));