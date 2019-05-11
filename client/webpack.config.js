const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: ['babel-polyfill', './index.js'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '',
    filename: '[name].bundle.js'
  },
  devtool: '#source-map',
  module: {
    rules: [
      {
        use: 'babel-loader',
        test: /\.(js|jsx)$/,
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loader: ['style-loader', 'css-loader'],
        include: __dirname + '/'
      },
      {
        test: /\.styl$/,
        loader: 'style-loader!css-loader!stylus-loader',
        include: __dirname + '/'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  devServer: {
    historyApiFallback: true,
    port: 3000,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html'),
      filename: 'index.html',
      inject: 'body'
    }),
    new webpack.DefinePlugin({ "process.env.NODE_ENV": JSON.stringify("development") })
  ]
};
