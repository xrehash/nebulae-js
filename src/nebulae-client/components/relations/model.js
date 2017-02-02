/* Relations */

var RelationshipTypeEditorViewModel = (function () {

  function RelationshipTypeEditorViewModel(relationshipType, listResourceTypes) {
    var self = this;
    self.listResourceTypes = listResourceTypes;
    self.relationshipType = relationshipType;
    self.saveClick = function () {
      var rt = self.relationshipType;
      if (rt.sourceType && rt.targetType && rt.name) {
        networkCall.SaveRelationType(rt, function () {
          console.log("save done");
        }, function (err) {
          console.log("Saved failed.", err);
        });
        $.gevent.publish('spa-model-save-relationshiptype-edit', []);
      } else {
        console.log("Missing data", rt);
        alert("Missing data!");
      }
    };
    self.cancelClick = function () {
      $.gevent.publish('spa-model-cancel-relationshiptype-edit', []);
    };
  }

  return RelationshipTypeEditorViewModel;
})();

var RelationshipEditorViewModel = (function () {
  function RelationshipEditorViewModel(relationship, relationshipTypeList) {
    var self = this;
    self.relationship = {
      _id: relationship._id,
      family: new ko.observable(relationship.family),
      source: new ko.observable(relationship.source),
      target: new ko.observable(relationship.target)
    };
    self.relationshipTypeList = relationshipTypeList;
    self.selectedType = new ko.observable();
    self.sourceList = new ko.observableArray();
    self.targetList = new ko.observableArray();
    self.sourceType = new ko.observable();
    self.sourceTypeName = new ko.pureComputed(function () {
      return (self.sourceType() ? self.sourceType().name : '');
    });
    self.targetType = new ko.observable();
    self.targetTypeName = new ko.pureComputed(function () {
      return (self.targetType() ? self.targetType().name : '');
    });

    self.nameSortFn = (a, b) => {
      return a.name == b.name ? 0 : (a.name > b.name ? 1 : -1);
    };

    self.updateAvailableResources = function () {
      self.relationship.family(self.selectedType()._id);
      self.relationship.source(undefined);
      self.relationship.target(undefined);
      networkCall.GetResourcesByType(self.selectedType().sourceType,
        function (data) {
          self.sourceList(data.sort(self.nameSortFn));
          console.log(self.sourceList());
        },
        function (error) {
          console.log(error);
        });

      networkCall.GetResourcesByType(self.selectedType().targetType,
        function (data) {
          //console.log("tgt", data);
          self.targetList(data.sort(self.nameSortFn));
        },
        function (error) {
          console.log(error);
        });

      networkCall.GetResourceType(self.selectedType().sourceType,
        function (data) {
          //console.log("src", data);
          self.sourceType(data);
        },
        function (error) {
          console.log(error);
        });
      networkCall.GetResourceType(self.selectedType().targetType,
        function (data) {
          //console.log("src", data);
          self.targetType(data);
        },
        function (error) {
          console.log(error);
        });
    };

    self.cancel = function () {
      $.gevent.publish('spa-model-cancel-relationship-edit', []);
    };
    self.save = function () {
      var data = {
        _id: self.relationship._id,
        family: self.relationship.family(),
        source: self.relationship.source(),
        target: self.relationship.target()
      };
      console.log(data);
      networkCall.SaveRelationship(data, function () {
        $.gevent.publish('spa-model-save-relationship-edit', []);
      }, function (error) {
        console.log(error);
      })
    };
    self.init = function () {
      self.selectedType.subscribe(self.updateAvailableResources);
    };


    self.init();
  }

  return RelationshipEditorViewModel;
})();

var RelationshipBrowserViewModel = (function () {
  function RelationshipBrowserViewModel(ResourceTypeList, RelationshipTypeList) {
    var self = this;
    self.resourceTypeList = ResourceTypeList;
    self.relationshipTypeList = RelationshipTypeList;
    self.searchCriteria = ko.observable();
    self.relationshipBag = ko.observableArray();
    self.resourceBag = ko.observableArray();

    self.resetSearch = function () {
      self.searchCriteria({
        sourceName: new ko.observable(),
        relationshipType: new ko.observable(),
        targetName: new ko.observable()
      });
    };
    self.searchClick = function () {
      console.log(self.searchCriteria().relationshipType());
      networkCall.SearchForRelations({
        relationshipType: self.searchCriteria().relationshipType()._id,
        sourceName: self.searchCriteria().sourceName()
      }, function (response) {
        console.log(response);
      }, function (error) {
        console.log(error);
      });
    };

    self.init = function () {
      self.resetSearch();
    };

    self.init();

  }
  return RelationshipBrowserViewModel;
})();


var Model = (function () {
  function ViewModel(App) {
    var self = this;
    self.App = App;
    App.PageTitle("Relations");
    self.listResourceTypes = new ko.observableArray();
    self.relationTypeEditorModel = new ko.observable();
    self.relationshipEditor = new ko.observable();
    self.relationshipBrowser = new ko.observable();
    self.relationshipTypeList = new ko.observableArray();

    self.nameSortFn = (a, b) => {
      return a.name == b.name ? 0 : (a.name > b.name ? 1 : -1);
    };

    self.browseClick = function () {
      if (!self.relationshipBrowser())
        self.relationshipBrowser(new RelationshipBrowserViewModel(self.listResourceTypes, self.relationshipTypeList));
    };
    self.loadResourceTypeList = function () {
      networkCall.GetResourceTypes(function (listData) {
          //console.log(listData);
          self.listResourceTypes(listData);
        },
        function (error) {
          console.log(error);
        }
      );
    };
    self.loadRelationshipTypeList = function () {
      networkCall.GetRelationshipTypes(function (listData) {
        self.relationshipTypeList(listData.sort(self.nameSortFn));
      }, function (error) {
        console.log(error);
      });
    };
    self.newRelTypeClick = function () {
      var relationshipType = new nebulae.RelationshipType(nebulae.newId());
      self.editRelationType(relationshipType);
    }
    self.relEditorClick = function () {
      var relationship = new nebulae.Relationship(nebulae.newId());
      self.editRelationship(relationship);
    };
    self.editRelationship = function (relationship) {
      if (!self.relationshipEditor()) {
        self.relationshipEditor(new RelationshipEditorViewModel(relationship, self.relationshipTypeList));
      }
    }
    self.editRelationType = function (relType) {
      if (!self.relationTypeEditorModel())
        self.relationTypeEditorModel(new RelationshipTypeEditorViewModel(relType, self.listResourceTypes));
    }
    self.cancelEditHandler = function (evt, changeType, changes) {
      self.relationTypeEditorModel(undefined);
      self.loadRelationshipTypeList();
    };
    self.saveEditHandler = function (evt, changeType, changes) {
      self.relationTypeEditorModel(undefined);
    };
    self.cancelRelationshipEditHandler = function (evt, changeType, changes) {
      self.relationshipEditor(undefined);
    };
    self.saveRelationshipEditHandler = function (evt, changeType, changes) {
      self.editRelationship(undefined);
      self.relationshipEditor(undefined);
    };

    self.init = function () {

      $.gevent.subscribe($(document), 'spa-model-cancel-relationshiptype-edit', self.cancelEditHandler);
      $.gevent.subscribe($(document), 'spa-model-save-relationshiptype-edit', self.saveEditHandler);
      $.gevent.subscribe($(document), 'spa-model-cancel-relationship-edit', self.cancelRelationshipEditHandler);
      $.gevent.subscribe($(document), 'spa-model-save-relationship-edit', self.saveRelationshipEditHandler);
      self.loadResourceTypeList();
      self.loadRelationshipTypeList();
    };

    self.init();

  };
  return ViewModel;
})();