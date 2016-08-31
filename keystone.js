// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').config();
var configFile = require('config');

var keystone = require('keystone'),
webpack = require('webpack'),
devMiddleware = require('webpack-dev-middleware'),
hotMiddleware = require('webpack-hot-middleware'),
config = require('./webpack.config.dev'),
compiler = webpack(config)
customFields = require('keystone-custom-fieldtypes')

customFields.loadFromDir('./src/fields');

// Require keystone
var keystone = require('keystone');
var dbConfig = configFile.get('mongo');

const mongoUsername = process.env.MONGO_USERNAME ?
  `${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@` : ''

var mongoUri = process.env.MONGO_URI || `mongodb://${mongoUsername}${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB_NAME}`

keystone.init({
  'name': 'RateCity Data',
  'brand': 'RateCity Data',

  'sass': 'public',
  'static': 'public',
  'favicon': 'public/favicon.ico',
  'views': 'templates/views',
  'view engine': 'jade',

  'emails': 'templates/emails',

  'auto update': true,
  'session': true,
  'auth': true,
  'user model': 'User',
  'port': '4000',
  'session store': 'connect-mongostore',
  'session store options': {
    'db': process.env.MONGO_DB_NAME,
    'host': process.env.MONGO_HOST,
    'port': process.env.MONGO_PORT,
    'username': process.env.MONGO_USERNAME,
    'password': process.env.MONGO_PASSWORD
  },
  'mongo' : process.env.MONGO_URI
});

if (process.env.NODE_ENV == 'development') {
  keystone.pre('routes', devMiddleware(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
  }))

  keystone.pre('routes', hotMiddleware(compiler))
};

keystone.import('models');
keystone.set('locals', {
  _: require('lodash'),
  env: keystone.get('env'),
  utils: keystone.utils,
  editable: keystone.content.editable,
});
keystone.set('routes', require('./routes'));
keystone.set('email locals', {
  logo_src: '/images/logo-email.gif',
  logo_width: 194,
  logo_height: 76,
  theme: {
    email_bg: '#f9f9f9',
    link_color: '#2697de',
    buttons: {
      color: '#fff',
      background_color: '#2697de',
      border_color: '#1a7cb7',
    },
  },
});
keystone.set('email tests', require('./routes/emails'));
keystone.set('nav', {
  users: 'users',
});

keystone.start();
