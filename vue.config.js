const webpack = require('webpack');
const { version } = require('./package.json')

module.exports = {
  baseUrl: '/Retrop-demo/',

  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'VERSION': JSON.stringify(version),
      })
    ]
  }
}
