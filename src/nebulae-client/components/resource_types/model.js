/** View Model */

var Model = (function () {
  function ViewModel(App) {
    var self = this;
    self.App = App;
    self.greeting = "Resource Types";
    self.App.PageTitle(self.greeting);
    self.listResourceTypes = ko.observableArray();
    self.newResourceType = {
      _id: ko.observable("" + (function () {
        var dt = new Date();
        var num = Math.floor(Math.random() * 100 * Date.now());
        return "" + dt.getFullYear() + dt.getMonth() + dt.getDay() + dt.getHours() + dt.getMinutes() + "_" + num;
      })()),
      name: ko.observable(""),
      parent: ko.observable(null),
      schema: ko.observable(null)
    };
    self.saveForm = function () {
      var rt = new nebulae.ResourceType(self.newResourceType._id(),
        self.newResourceType.name(),
        self.newResourceType.parent() || "",
        self.newResourceType.schema() || "");
      console.log('clicking!!');
      console.log(rt);
      networkCall.SaveResourceType(rt).then(function (response) {
          console.log("good", response);
        },
        function (error) {
          console.log("error", error);
        });
    };
    networkCall.GetResourceTypes().then(
      function (response) {
        var rr = JSON.parse(response);
        console.log(response);
        var listData = rr.rows.map((v, i, s) => {
          return {
            id: v.id,
            name: v.value[0]
          }
        });
        console.log(listData);
        self.listResourceTypes(listData);
      },
      function (error) {
        console.log(error);
      }
    );
  }
  return ViewModel;
})();