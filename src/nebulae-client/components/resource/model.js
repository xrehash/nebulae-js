/** */

// ko.components.register('nebulae-resource-editor', {
//   viewModel: ResourceEditor,
//   template: {
//     element: 'resource_editor_template'
//   }
// });


var Model = (function () {
  function ViewModel(App) {
    var self = this;
    App.PageTitle("Resources");
    self.App = App;
    self.listResourceTypes = new ko.observableArray();
    self.resourceType = new ko.observable();
    self.resourceEditor = new ko.observable();

    // methods
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

    self.createResourceClick = function () {
      if (self.resourceType()) {
        self.displayNewResourceForm(self.resourceType());
      }
    };
    self.displayNewResourceForm = function (resType) {
      console.log("make new", resType);
      if (!self.resourceEditor()) {
        var re = new ResourceEditor(self);

        re.resourceType(resType);
        re.isVisible(true);
        re.resource(new nebulae.Resource(nebulae.newId(), null, resType))
        self.resourceEditor(re);
        console.log(re.resource());
      }
    };
    self.cancelEditHandler = function (evt, changeType, changes) {
      self.resourceEditor(undefined);
    };


    self.init = function () {
      self.loadResourceTypeList();
      $.gevent.subscribe($(document), 'spa-model-cancel-resource-edit', self.cancelEditHandler);
      return true;
    };


    self.init();
  }
  return ViewModel;
})();

var ResourceEditor = (function () {
  function ResourceEditor(context) {
    //TODO view model for editor
    self = this;
    self.context = context;
    self.resourceType = new ko.observable();
    self.resource = ko.observable();
    self.isVisible = ko.observable(false);
    self.pcount = 0;
    self.pIndex = {};
    //methods
    self.propId = function (pName) {
      if (self.pIndex[pName]) {
        return self.pIndex[pName];
      } else {
        self.pIndex[pName] = self.resource()._id + '_' + (self.pcount++);
      }
      return self.pIndex[pName];
    };
    self.propType = function (pName) {
      return 'text';
    };
    self.cancelClick = function () {
      if (confirm("Abandon creation of " + self.resourceType().name + "?")) {
        $.gevent.publish('spa-model-cancel-resource-edit', []);
        self.isVisible(false);
      }
    }
  }
  return ResourceEditor;
})();