/** */

var Model = function (App) {
  var self = this;
  App.PageTitle("Resources");
  self.App = App;
  self.listResourceTypes = new ko.observableArray();
  self.resourceType = new ko.observable();

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

  self.loadResourceTypeList();


};