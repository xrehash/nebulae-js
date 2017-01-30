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
    self.relationship = new ko.observable(relationship);
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
      self.relationship().family = self.selectedType()._id;
      self.relationship().source = self.relationship().target = undefined;
      networkCall.GetResourcesByType(self.selectedType().sourceType,
        function (data) {
          self.sourceList(data.sort(self.nameSortFn));
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
      $.gevent.publish('spa-model-save-relationship-edit', []);
    };
    self.init = function () {
      self.selectedType.subscribe(self.updateAvailableResources);
    };


    self.init();
  }

  return RelationshipEditorViewModel;
})();

var Model = (function () {
  function ViewModel(App) {
    var self = this;
    self.App = App;
    App.PageTitle("Relations");
    self.listResourceTypes = new ko.observableArray();
    self.relationTypeEditorModel = new ko.observable();
    self.relationshipEditor = new ko.observable();
    self.relationshipTypeList = new ko.observableArray();

    self.nameSortFn = (a, b) => {
      return a.name == b.name ? 0 : (a.name > b.name ? 1 : -1);
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

    self.init = function () {

      $.gevent.subscribe($(document), 'spa-model-cancel-relationshiptype-edit', self.cancelEditHandler);
      $.gevent.subscribe($(document), 'spa-model-save-relationshiptype-edit', self.saveEditHandler);
      $.gevent.subscribe($(document), 'spa-model-cancel-relationship-edit', self.cancelRelationshipEditHandler);
      self.loadResourceTypeList();
      self.loadRelationshipTypeList();
    };

    self.init();

  };
  return ViewModel;
})();