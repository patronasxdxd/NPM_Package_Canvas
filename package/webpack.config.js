const path = require('path');

module.exports = {
  entry: './index.js',
  output: {
    filename: 'canvas-edit-tools.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'CanvasEditTools',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};