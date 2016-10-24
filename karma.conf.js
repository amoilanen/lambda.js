var path = require('path');

module.exports = function(config) {

  var configuration = {
    basePath: '.',
    frameworks: ['jasmine'],
    files: [
      'spec/index.js'
    ],
    preprocessors: {
      'spec/index.js': ['webpack', 'sourcemap']
    },
    browsers: ['PhantomJS'],
    reporters: ['spec'],
    singleRun: true,
    webpack: {
      devtool: 'inline-source-map',
      resolve: {
        root: [
          path.resolve('./lib'),
          path.resolve('./spec')
        ]
      },
      module: {
        loaders: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel',
            query: {
              presets: ['es2015']
            }
          }
        ]
      }
    }
  };

  if (config.tdd) {
    configuration = Object.assign(configuration, {
      browsers: ['Chrome'],
      reporters: ['dots'],
      singleRun: false,
      autoWatch: true
    });
  }

  config.set(configuration);
};