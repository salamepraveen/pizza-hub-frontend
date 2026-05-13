// karma.conf.js
const path = require('path');

module.exports = function (config) {
  config.set({
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      dir: path.join(__dirname, 'coverage'),
      reporters: [
        { type: 'json', subdir: '.', file: 'coverage-summary.json' },
        { type: 'text' }
      ]
    },
    // keep other default Karma settings (port, browsers, etc.)
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    }
  });
};
