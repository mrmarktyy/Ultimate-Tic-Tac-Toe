require('dotenv').load()

var path = require('path'),
    webpack = require('webpack')

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: [
    'webpack-hot-middleware/client',
  ],
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'client.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['', '.coffee', '.js', '.css'],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
  module: {
    loaders: [{
      test: /\.coffee$/,
      loaders: ['react-hot', 'transform?envify', 'coffee'],
      include: path.join(__dirname, 'app'),
    }, {
      test: /main\.css$/,
      loaders: [
        'style-loader',
        'css-loader?importLoaders=1',
        'postcss-loader',
      ],
    }],
  },
}
