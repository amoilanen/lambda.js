module.exports = function(config) {

  var configuration = {
   basePath: '.',
   frameworks: ['jasmine'],
   files: [
     'lib/**/*.js',
     'spec/**/*.js'
   ],
    preprocessors: {
      'lib/**/*.js': ['babel'],
      'spec/**/*.js': ['babel']
    },
    browsers: ['PhantomJS'],
    reporters: ['spec'],
    singleRun: true,
    babelPreprocessor: {
      options: {
        presets: ['es2015'],
        sourceMap: 'inline'
      },
      /*filename: function (file) {
        return file.originalPath.replace(/\.js$/, '.es5.js');
      },
      sourceFileName: function (file) {
        return file.originalPath;
      }*/
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