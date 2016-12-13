var ko = require('knockout');
SystemJS.import('bootstrap');

require('router');
require('jquery');
require('lib/jquery.event.gevent.js');
require('lib/services.js');
require('lib/nebulae.js');


var zApp = function () {
    var self = this;
    self.Router = Router;

    self.start = function () {
        console.log('starting app');
        window.ko = ko;
        //window.nebulae = nebulae;
        //window.dbServices = dbServices;
        ko.applyBindings(self, document.getElementById('body'));
        self.Router.navigate('home');
    };

    self.PageTitle = ko.observable("");

    self.present = function (comp) {
        var view = 'components/' + comp + '/view.html';
        var model = 'components/' + comp + '/model.js';
        var viewText = '';
        var req = $.get(view);
        req.done(function (data) {
            //console.log(ko);            
            viewText = data;
            $.get(model, function (scriptText) {
                $("#page").empty();
                $("#page").append(viewText);
                $("#page").append("<script>(function(){" + scriptText + "if(Model){var model = new Model(App);var comp = document.getElementById('page').getElementsByClassName('component').item(0);ko.applyBindings(model,comp);}})();</script>");

            });
        });

        req.error = function (obj, err) {
            console.log(arguments);
        };
    };
};

$(document).ready(function (_) {

    var App = new zApp();
    window.App = App;
    App.Router.config({
        mode: 'fragment'
    });
    App.Router.add(/(.*)/, function () {
        console.log(arguments);
        App.present(arguments[0]);
    }).listen();

    App.start();
});