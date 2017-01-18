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
    function GetResourceTypes(ok, problem) {
      var queryURL = "https://couchdb-076880.smileupps.com/nebulae_resource_types/_design/resource_type_names/_view/names";
      var p = get(queryURL);
      p.then(
        function (response) {
          var rr = JSON.parse(response);
          //console.log(response);
          var listData = rr.rows.map((v, i, s) => {
            return {
              id: v.id,
              name: v.value[0],
              parentId: v.value[1],
              schema: v.value[2]
            }
          });
          //console.log(listData);
          ok(listData);
        },
        function (error) {
          problem(error);
        }
      );
      return p;
    }
    return GetResourceTypes;
  }());
  networkCall.GetResourceTypes = GetResourceTypes;

  var SaveResource = (function () {
    function SaveResource(resource) {
      var docURL = "https://couchdb-076880.smileupps.com/nebulae_resources";
      return post(docURL, JSON.stringify(resource));
    }
    return SaveResource;
  })();
  networkCall.SaveResource = SaveResource;

  var SaveResourceType = (function () {
    function SaveResourceType(data) {
      var docURL = "https://couchdb-076880.smileupps.com/nebulae_resource_types";
      return post(docURL, JSON.stringify(data));
    }
    return SaveResourceType;
  }());
  networkCall.SaveResourceType = SaveResourceType;

})(networkCall || (networkCall = {}));