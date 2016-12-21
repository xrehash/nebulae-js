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
      self.schema.push(JSON.parse(text));
    };
  };
  return SchemaEditor;
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
      return self.parent().id
    });
    self.schema = ko.observableArray([]);
    self.schemaText = ko.computed(function () {
      return JSON.stringify(self.schema());
    });
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
          console.log(response);
          var listData = rr.rows.map((v, i, s) => {
            return {
              id: v.id,
              name: v.value[0],
              parentId: v.value[1],
              schema: v.value[2]
            }
          });
          console.log(listData);
          self.listResourceTypes(listData);
        },
        function (error) {
          console.log(error);
        }
      );
    };
    self.loadParentList();
  }
  return ViewModel;
})();