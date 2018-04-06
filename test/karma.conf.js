// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2015-07-28 using
// generator-karma 1.0.0

module.exports = function(config) {
    'use strict';

    config.set({
        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // base path, that will be used to resolve files and exclude
        basePath: '../',

        // testing framework to use (jasmine/mocha/qunit/...)
        // as well as any additional frameworks (requirejs/chai/sinon/...)
        frameworks: [
            'jasmine'
        ],

        // list of files / patterns to load in the browser
        files: [
            'node_modules/jquery/dist/jquery.js',
            'node_modules/angular/angular.js',
            'node_modules/angular-animate/angular-animate.js',
            'node_modules/angular-aria/angular-aria.js',
            'node_modules/angular-mocks/angular-mocks.js',
            'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
            'node_modules/angular-clipboard/angular-clipboard.js',
            'node_modules/angular-loading-bar/build/loading-bar.js',
            'node_modules/angular-material/angular-material.js',
            'node_modules/angular-media-queries/match-media.js',
            'node_modules/angular-translate/dist/angular-translate.js',
            'node_modules/angular-relative-date/angular-relative-date.js',
            'node_modules/angular-resource/angular-resource.js',
            'node_modules/angular-sanitize/angular-sanitize.js',
            'node_modules/tv4/tv4.js',
            'node_modules/objectpath/lib/ObjectPath.js',
            'node_modules/angular-schema-form/dist/schema-form.js',
            'node_modules/angular-schema-form/dist/bootstrap-decorator.js',
            'node_modules/angular-ui-router/release/angular-ui-router.js',
            'node_modules/underscore/underscore.js',
            'node_modules/backbone/backbone.js',
            'node_modules/d3/d3.js',
            'node_modules/c3/c3.js',
            'node_modules/c3-angular/c3-angular.min.js',
            'node_modules/handlebars/dist/handlebars.js',
            'node_modules/marked/lib/marked.js',
            'node_modules/@flowjs/flow.js/dist/flow.js',
            'node_modules/@flowjs/ng-flow/dist/ng-flow.js',
            'node_modules/ng-tags-input/build/ng-tags-input.min.js',
            'node_modules/ngstorage/ngStorage.js',
            'node_modules/perfect-scrollbar/dist/js/perfect-scrollbar.jquery.js',
            'node_modules/perfect-scrollbar/dist/js/perfect-scrollbar.js',
            'node_modules/rangy/lib/rangy-core.js',
            'node_modules/rangy/lib/rangy-classapplier.js',
            'node_modules/rangy/lib/rangy-highlighter.js',
            'node_modules/rangy/lib/rangy-selectionsaverestore.js',
            'node_modules/rangy/lib/rangy-serializer.js',
            'node_modules/rangy/lib/rangy-textrange.js',
            'node_modules/textangular/dist/textAngular.js',
            'node_modules/textangular/dist/textAngular-sanitize.js',
            'node_modules/textangular/dist/textAngularSetup.js',
            'node_modules/angular-jwt/dist/angular-jwt.js',
            'node_modules/highlight.js/lib/highlight.js',
            'client/scripts/**/*.js',
            'test/spec/**/*.js'
        ],

        // list of files / patterns to exclude
        exclude: [
        ],

        // web server port
        port: 8080,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: [
            'PhantomJS'
        ],

        // Which plugins to enable
        plugins: [
            'karma-phantomjs-launcher',
            'karma-jasmine',
            'karma-bamboo-reporter'
        ],

        // Report test results to bamboo
        reporters: ['bamboo'],
        bambooReporter:{
            filename: 'mocha.json' //optional, defaults to "mocha.json"
        },

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false,

        colors: true,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,

        // Uncomment the following lines if you are using grunt's server to run the tests
        // proxies: {
        //   '/': 'http://localhost:9000/'
        // },
        // URL root prevent conflicts with the site root
        // urlRoot: '_karma_'
    });
};
