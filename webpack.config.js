const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const global = require('./src/global')

const webpack = require ('webpack')

module.exports = {
  entry: {
    index: path.resolve(__dirname, 'src', 'main.js')
  },
  output: {
    // path: path.resolve(__dirname, "dist")
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html')
    }),
    new webpack.DefinePlugin(global)
  ]
}
