var HtmlWebpackPlugin = require('html-webpack-plugin')
var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');


var HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
  template: __dirname + '/app/index.html',
  filename: 'index.html',
  inject: 'body'
});
module.exports = {
  entry: [
    './index.js'
  ],
  output: {
    path: __dirname + '/dist',
    filename: "index_bundle.js"
  },
  module: {
    loaders: [
      {test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"},
      {test: /\.css$/, loader: "style-loader!css-loader" },
      {test: /\.ttf$/, loader: 'file-loader?name=[name].[ext]'},
      {test: /\.png$/, loader: 'file-loader?name=[name].[ext]'}
    ]
  },
  plugins: [HTMLWebpackPluginConfig,
            new CopyWebpackPlugin([{from: 'static', 'to': 'static'}])],

  context: path.join(__dirname, 'app'),

  devServer: {
        // This is required for older versions of webpack-dev-server
        // if you use absolute 'to' paths. The path should be an
        // absolute path to your build destination.
        outputPath: path.join(__dirname, 'dist'),
        historyApiFallback: true
    },

};
