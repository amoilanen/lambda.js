var path = require('path');

module.exports = {
  entry: "./lib/lambda.js",
  resolve: {
    root: [
      path.resolve('./lib')
    ]
  },
  output: {
    path: "dist",
    filename: "lambda.js",
    libraryTarget: "umd"
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
};