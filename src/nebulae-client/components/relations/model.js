/* Relations */

var RelationshipTypeEditorViewModel = (function () {

  function RelationshipEditorViewModel(relationshipType, listResourceTypes) {
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

  return RelationshipEditorViewModel;
})();

var Model = (function () {
  function ViewModel(App) {
    var self = this;
    self.App = App;
    App.PageTitle("Relations");
    self.listResourceTypes = new ko.observableArray();
    self.relationTypeEditorModel = new ko.observable();

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
    self.newRelTypeClick = function () {
      var relationshipType = new nebulae.RelationshipType(nebulae.newId());
      self.editRelationType(relationshipType);
    }
    self.editRelationType = function (relType) {
      if (!self.relationTypeEditorModel())
        self.relationTypeEditorModel(new RelationshipTypeEditorViewModel(relType, self.listResourceTypes));
    }
    self.cancelEditHandler = function (evt, changeType, changes) {
      self.relationTypeEditorModel(undefined);
    };
    self.saveEditHandler = function (evt, changeType, changes) {
      self.relationTypeEditorModel(undefined);
    };
    self.init = function () {

      $.gevent.subscribe($(document), 'spa-model-cancel-relationshiptype-edit', self.cancelEditHandler);
      $.gevent.subscribe($(document), 'spa-model-save-relationshiptype-edit', self.saveEditHandler);
      self.loadResourceTypeList();
    };

    self.init();

  };
  return ViewModel;
})();