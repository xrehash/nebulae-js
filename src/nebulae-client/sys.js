SystemJS.config({
    map: {
        jquery: 'bower_components/jquery/dist/jquery.js',
        knockout: 'bower_components/knockout/dist/knockout.js',
        bootstrap: 'bower_components/bootstrap/dist/js/bootstrap.js',
        router: 'lib/router.js',
        text: 'bower_components/System.js/text.js'
            //nebulae: 'lib/nebulae.js',
            //services: 'lib/services.js'
    },

    meta: {
        '*.html': {
            loader: 'text'
        }
    }
});