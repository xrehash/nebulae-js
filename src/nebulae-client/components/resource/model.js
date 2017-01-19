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
    self.searchResults = new ko.observableArray();
    self.showResults = new ko.computed(function () {
      return self.searchResults().length ? true : false;
    });
    self.searchTarget = ko.observable();
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

    self.searchResourcesByType = function () {
      var target = self.resourceType();
      networkCall.GetResourcesByType(self.resourceType().id,
        function (results) {
          console.log(results);
          self.searchTarget(target.name);
          self.searchResults(results);
        },
        function (err) {
          console.log(err);
          alert(err);
        });
    };

    self.createResourceClick = function () {
      if (self.resourceType()) {
        self.displayNewResourceForm(self.resourceType());
      }
    };
    self.searchByResourceTypeClick = function () {
      if (self.resourceType()) {
        self.searchResourcesByType();
      }
    };

    self.displayNewResourceForm = function (resType) {
      if (!self.resourceEditor()) {
        var re = new ResourceEditor(self);

        re.resourceType(resType);
        re.isVisible(true);
        re.resource(new nebulae.Resource(nebulae.newId(), null, resType))
        self.resourceEditor(re);
      }
    };
    self.cancelEditHandler = function (evt, changeType, changes) {
      self.resourceEditor(undefined);
    };
    self.saveDoneHandler = function (evt, changeType, changes) {
      self.resourceEditor(undefined);
    };

    self.init = function () {
      self.loadResourceTypeList();
      $.gevent.subscribe($(document), 'spa-model-cancel-resource-edit', self.cancelEditHandler);
      $.gevent.subscribe($(document), 'spa-model-save-resource-done', self.saveDoneHandler);
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
      var ftype = self.resourceType().schema.find(function (elm, idx, arr) {

        if (elm[pName]) {
          return true;
        }
        return false;
      });
      switch (ftype[pName]) {
        case 'string':
          return 'text';
        case 'date':
          return 'date';
        case 'number':
          return 'number';
      }
      return 'text';
    };
    self.cancelClick = function () {
      if (confirm("Abandon creation of " + self.resourceType().name + "?")) {
        $.gevent.publish('spa-model-cancel-resource-edit', []);
        self.isVisible(false);
      }
    }
    self.saveClick = function () {
      // ugly hack
      // TODO refactor/fix this misery
      var resourceData = {
        _id: self.resource()._id,
        resourceTypeId: self.resourceType().id,
        name: self.resource().name()
      };
      var rType = self.resource().resourceType;
      var r = self.resource();
      if (rType.schema && rType.schema.length) {
        rType.schema.map(function (v, i, Arr) {
          var pName = Object.getOwnPropertyNames(v)[0];
          resourceData[pName] = r[pName]();
        });
      }
      console.log('saving resource', resourceData);
      var promise = networkCall.SaveResource(resourceData);
      promise.then(function (res) {
          $.gevent.publish('spa-model-save-resource-done', []);
          self.isVisible(false);
        },
        function (err) {
          console.log(err);
          alert(err);
        });
    };
  }
  return ResourceEditor;
})();