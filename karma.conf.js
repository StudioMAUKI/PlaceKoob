// Karma configuration
// Generated on Wed Feb 17 2016 15:43:40 GMT+0900 (KST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'www/lib/md5.js',
      'www/lib/ionic/js/ionic.bundle.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'www/lib/ngCordova/dist/ng-cordova.js',
      // 'www/lib/ngCordova/dist/ng-cordova-mocks.js',
      'www/common/**/*.js',
      'www/album/**/*.js',
      'www/config/**/*.js',
      'www/placelist/**/*.js',
      'www/register/**/*.js',
      'www/saveplace/**/*.js',      
      'www/spec/**/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'junit'],


    // web server port
    port: 9877,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    plugins: [
      'karma-chrome-launcher',
      'karma-jasmine',
      'karma-junit-reporter'
    ],

    junitReporter: {
      outputDir: 'test_result',
      outputFile: 'unit_test.xml',
      suite: 'unit',
      useBrowserName: true
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
