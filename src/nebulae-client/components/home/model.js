/** home model */

var Model = function(App){
    var self = this;
    App.PageTitle("Home");
    self.greeting = "Howdy Silly";
    self.wee = function(evt){
        Router.navigate("wee");
    };
};