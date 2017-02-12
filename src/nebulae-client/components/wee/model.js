/** wee model */

var Model = function (App) {
    var self = this;
    App.PageTitle("Bye");
    self.greeting = "Bye Smarty Pants";
    self.home = function (evt) {
        Router.navigate("home");
    };
};