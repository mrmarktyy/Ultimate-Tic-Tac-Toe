const keystone = require('keystone')

keystone.init({
  'auto update': true,
  'session': true,
  'auth': true,
  'user model': 'User',
  'session store': 'mongo',
  'mongo': process.env.MONGO_URI,
})

try {
  keystone.import('../models')
} catch (error) {
  keystone.import('models')
}

module.exports = keystone
