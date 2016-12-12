/** wee model */

var Model = function(App){
    var self = this;
    App.PageTitle("Bye");
    self.greeting = "Bye Silly";
    self.home = function(evt){
        Router.navigate("home");
    };
};