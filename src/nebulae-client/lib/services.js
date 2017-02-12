var networkCall;
var config = {
  dbURL: 'https://couchdb-076880.smileupps.com/'
};

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
      var queryURL = config.dbURL + "nebulae_resource_types/_design/resource_type_names/_view/names";
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
  })();
  networkCall.GetResourceTypes = GetResourceTypes;

  var GetRelationshipTypes = (function () {
    function GetRelationshipTypes(ok, problem) {
      var queryURL = config.dbURL + "nebulae_relations/_design/relations/_view/relationship_types?include_docs=true";
      //console.log(queryURL);
      var p = get(queryURL);
      p.then(
        function (response) {
          var rr = JSON.parse(response);
          //console.log(rr.rows);

          //console.log(listData);
          ok(rr.rows);
        },
        function (error) {
          problem(error);
        }
      );
      return p;
    }
    return GetRelationshipTypes;
  })();
  networkCall.GetRelationshipTypes = GetRelationshipTypes;

  var GetResource = (function () {
    function GetResource(id, ok, problem) {
      var queryURL = config.dbURL + "nebulae_resources/" + id;
      var p = get(queryURL);
      p.then(
        function (response) {
          var res = JSON.parse(response);
          //console.log(res);
          ok(res);
        },
        function (error) {
          problem(error);
        }
      );
      return p;
    }
    return GetResource;
  })();
  networkCall.GetResource = GetResource;

  var GetResources = (function () {
    function GetResources(arrResourceIds, ok, err) {
      var queryURL = config.dbURL + "nebulae_resources/_all_docs?include_docs=true";
      var req = JSON.stringify({
        keys: arrResourceIds
      });
      //console.log("-----<<<<<<<", req);
      var p = post(queryURL, req);
      p.then(function (resp) {
        //console.log(resp);
        var jdata = JSON.parse(resp);
        data = jdata.rows.map(function (row, id) {
          return row.doc;
        });
        ok(data);
      }, err);
      return p;
    }
    return GetResources;
  })();
  networkCall.GetResources = GetResources;

  //https://couchdb-076880.smileupps.com/nebulae_resources/_design/resources_views/_view/resourcesByType?key=%2220161131616_98826662250411%22&include_docs=true
  var GetResourcesByType = (function () {
    function GetResourcesByType(resourceTypeId, ok, problem) {
      var queryURL = config.dbURL + 'nebulae_resources/_design/resources_views/_view/resourcesByType?key="' + resourceTypeId + '"';
      var p = get(queryURL);
      p.then(
        function (response) {
          var rr = JSON.parse(response);
          //console.log(response);
          var listData = rr.rows.map((v, i, s) => {
            return {
              id: v.id,
              _id: v.id,
              name: v.value
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
    return GetResourcesByType;
  })();
  networkCall.GetResourcesByType = GetResourcesByType;

  var SearchForRelations = (function () {
    function SearchForRelations(queryConf, ok, err) {
      var queryURL = config.dbURL + 'nebulae_relations/_design/relations/_view/';
      var query = "";
      if (queryConf && queryConf.relationshipType) {
        queryURL += 'byType';
        query += ('?key="' + queryConf.relationshipType + '"');
      } else if (queryConf && queryConf.source) {
        queryURL += 'bySource';
        query += ('?key="' + queryConf.source + '"');
      } else if (queryConf && queryConf.target) {
        queryURL += 'byTarget';
        query += ('?key="' + queryConf.target + '"');
      }
      queryURL = queryURL + encodeURI(query);
      console.log(queryURL);
      get(queryURL).then(ok, err);
    }
    return SearchForRelations;
  })();
  networkCall.SearchForRelations = SearchForRelations;

  var SaveRelationship = (function () {
    function SaveRelationship(relation, done, err) {
      var docURL = config.dbURL + "nebulae_relations";
      var prom = post(docURL, JSON.stringify(relation));
      prom.then(done, err);
    }
    return SaveRelationship;
  })();
  networkCall.SaveRelationship = SaveRelationship;

  var SaveResource = (function () {
    function SaveResource(resource) {
      var docURL = config.dbURL + "nebulae_resources";
      return post(docURL, JSON.stringify(resource));
    }
    return SaveResource;
  })();
  networkCall.SaveResource = SaveResource;

  var SaveResourceType = (function () {
    function SaveResourceType(data) {
      var docURL = config.dbURL + "nebulae_resource_types";
      return post(docURL, JSON.stringify(data));
    }
    return SaveResourceType;
  }());
  networkCall.SaveResourceType = SaveResourceType;

  var GetResourceType = (function () {
    function GetResourceType(resourceTypeId, ok, error) {
      var docURL = config.dbURL + "nebulae_resource_types/" + resourceTypeId;
      var p = get(docURL);
      p.then(function (data) {
        var dObj = JSON.parse(data);
        ok(dObj);
      }, error);
      return p;
    }
    return GetResourceType;
  })();
  networkCall.GetResourceType = GetResourceType;

  var SaveRelationType = (function () {
    function SaveRelationType(relationType, done, err) {
      var docURL = config.dbURL + "nebulae_relations";
      var prom = post(docURL, JSON.stringify(relationType));
      prom.then(done, err);
    }
    return SaveRelationType;
  })();
  networkCall.SaveRelationType = SaveRelationType;

})(networkCall || (networkCall = {}));