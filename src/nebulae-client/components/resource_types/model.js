/** View Model */

var SchemaEditor = (function () {
  function SchemaEditor(schema) {
    var self = this;
    self.schema = schema;
    self.propName = ko.observable();
    self.propType = ko.observable();
    self.listPropTypes = ko.observableArray(['string', 'number', 'date']);


    self.applyEditor = function () {
      var text = "{\"" + self.propName() + "\":\"" + self.propType() + "\"}";
      var elm = JSON.parse(text);
      var args = [elm];

      function removeMe() {
        console.log('clicked removeMe');
        $.gevent.publish('spa-model-schemaChange', ['remove', args]);
      };
      elm.removeMe = removeMe;
      $.gevent.publish('spa-model-schemaChange', ['add', args]);
      //self.schema.push(JSON.parse(text));
    };
  };
  return SchemaEditor;
})();

var SearchModel = (function () {
  function SearchModel(rTModel) {
    var self = this;
    self.rTModel = rTModel;
    self.searchTerm = ko.observable("");
    self.searchBoxKeyPress = function (obj, evt) {
      console.log(evt.originalEvent);
      if (evt.originalEvent.keyCode == 13) {
        setTimeout(self.doSearch, 100);
      }
      return true;
    };
    self.doSearch = function () {
      if (self.searchTerm()) {
        var target = new RegExp(self.searchTerm(), "i");
        var results = [];
        self.rTModel.listResourceTypes().map(function (rt, idx, arr) {
          if (target.test(rt.name)) {
            results.push(rt);
          }
        });
        self.resultList(results);
      };
    };
    self.resultList = ko.observableArray();

  }
  return SearchModel;

})();

var ResourceTypeModel = (function () {
  function ResourceTypeModel() {
    var self = this;
    self._id = ko.observable("" + (function () {
      var dt = new Date();
      var num = Math.floor(Math.random() * 100 * Date.now());
      return "" + dt.getFullYear() + dt.getMonth() + dt.getDay() + dt.getHours() + dt.getMinutes() + "_" + num;
    })());
    self.name = ko.observable("");
    self.parent = ko.observable('');
    self.parentId = ko.computed(function () {
      return self.parent() ? self.parent().id : undefined;
    });
    self.schema = ko.observableArray([]);
    self.schemaText = ko.computed(function () {
      return JSON.stringify(self.schema());
    });
    self.schemaChangeHandler = function (evt, changeType, changes) {
      console.log("Handling schema change", changeType, changes);
      switch (changeType) {
        case 'add':
          changes.forEach((z) => {
            self.schema.push(z);
          });
          break;
        case 'remove':
          console.log("remove", changes);
          changes.forEach((z) => {
            self.schema.remove(z);
          });
          break;
      }
    };
    self.parent.subscribe(function (nValue) {
      if (nValue && Array.isArray(nValue.schema)) {
        console.log("New parent selected adding schema", nValue.schema);
        nValue.schema.forEach((z) => {
          z.removeMe = function removeMe() {
            console.log('clicked removeMe');
            $.gevent.publish('spa-model-schemaChange', ['remove', [z]]);
          };
        });

        self.schemaChangeHandler(null, 'add', nValue.schema);
      }
    });
    $.gevent.subscribe($(document), 'spa-model-schemaChange', self.schemaChangeHandler);
  };
  return ResourceTypeModel;
})();

var Model = (function () {
  function ViewModel(App) {
    var self = this;
    self.App = App;
    self.greeting = "Resource Types";
    self.App.PageTitle(self.greeting);
    self.listResourceTypes = ko.observableArray();
    self.newResourceType = ko.observable();
    self.isSchemaEditorVisible = ko.observable(false);
    self.schemaEditorButtonContents = ko.computed(function () {
      return self.isSchemaEditorVisible() ? 'done' : 'edit';
    });
    self.toggleSchemaEditor = function () {
      self.isSchemaEditorVisible(!self.isSchemaEditorVisible());
    };
    self.isEditorVisible = ko.observable(false);
    self.editorButtonContents = ko.computed(function () {
      return self.isEditorVisible() ? ' hide editor' : ' show editor';
    });
    self.toggleEditor = function () {
      self.isEditorVisible(!self.isEditorVisible());
    };

    self.initFormModel = function () {
      self.newResourceType(new ResourceTypeModel());
      if (self.schemaEditorModel && typeof (self.schemaEditorModel) == 'function') {
        self.schemaEditorModel(new SchemaEditor(self.newResourceType().schema));
      } else {
        self.schemaEditorModel = ko.observable(new SchemaEditor(self.newResourceType().schema));
      }

    };
    self.initFormModel();


    self.saveForm = function () {
      var rt = new nebulae.ResourceType(self.newResourceType()._id(),
        self.newResourceType().name(),
        (self.newResourceType().parent() ? self.newResourceType().parent().id : undefined) || "",
        self.newResourceType().schema() || "");
      console.log('clicking!!');
      console.log(rt);
      networkCall.SaveResourceType(rt).then(function (response) {
          console.log("good", response);
          alert("Record Saved");
          self.loadParentList();
          self.initFormModel();

        },
        function (error) {
          console.log("error", error);
        });
    };
    self.loadParentList = function () {
      networkCall.GetResourceTypes().then(
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
          self.listResourceTypes(listData);
        },
        function (error) {
          console.log(error);
        }
      );
    };
    self.loadParentList();

    self.searchModel = ko.observable(new SearchModel(self));
  }
  return ViewModel;
})();