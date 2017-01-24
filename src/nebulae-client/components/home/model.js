/** home model */

var Model = function (App) {
    var self = this;
    App.PageTitle("Home");
    self.greeting = "Howdy Silly";
    self.wee = function (evt) {
        Router.navigate("wee");
    };
    self.go = function () {
        Router.navigate("resource_types");
    };
    self.go2 = function () {
        Router.navigate("resource");
    };
    self.go3 = function () {
        Router.navigate("relations");
    };
};