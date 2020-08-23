const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

// const global = require('./src/global')

const webpack = require('webpack')

module.exports = {
  entry: {
    index: path.resolve(__dirname, 'src', 'main.js')
  },
  output: {
    // path: path.resolve(__dirname, "dist")
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(jpg|png|gif|jpeg)$/,
        loader: 'url-loader',
        options: {
          // 图片小于8kb时候会被base64处理
          limit: 8 * 1024,
          // 给图片重新命名
          // ext 图片原来扩展名称
          name: '[hash:10].[ext]'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html')
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(__dirname, 'public/img'),
          to: path.join(__dirname, 'dist/img')
        }
      ]
    })
    // new webpack.DefinePlugin(global)
  ]
}
