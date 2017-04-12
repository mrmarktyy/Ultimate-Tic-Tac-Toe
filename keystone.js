// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').config()

var keystone = require('keystone')
var webpack = require('webpack')
var devMiddleware = require('webpack-dev-middleware')
var hotMiddleware = require('webpack-hot-middleware')
var config = require('./webpack.config.dev')
var compiler = webpack(config)

keystone.init({
  'name': 'RateCity Ultimate',
  'brand': 'RateCity Ultimate',

  'sass': 'public',
  'static': 'public',
  'favicon': 'public/favicon.ico',
  'views': 'templates/views',
  'view engine': 'jade',

  'emails': 'templates/emails',

  'auto update': true,
  'logger': 'combined',
  'session': true,
  'auth': true,
  'user model': 'User',
  'port': '4000',
  'session store': 'mongo',
  'mongo': process.env.MONGO_URI,
})

if (process.env.NODE_ENV === 'development') {
  keystone.pre('routes', devMiddleware(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath,
  }))

  keystone.pre('routes', hotMiddleware(compiler))
}

if (process.env.CLOUDINARY_URL) {
  keystone.set('cloudinary config', process.env.CLOUDINARY_URL)
  keystone.set('cloudinary folders', true)
}

keystone.import('models')
keystone.set('locals', {
  _: require('lodash'),
  env: keystone.get('env'),
  utils: keystone.utils,
  editable: keystone.content.editable,
})
keystone.set('routes', require('./routes'))
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
})

keystone.set('nav', {
  companies: ['Company', 'Branch', 'ATM'],
  homeLoans: ['CompanyHomeLoan', 'HomeLoanFamily', 'HomeLoan', 'HomeLoanVariation', 'HomeLoanSpecial', 'ExtraRepayment', 'OffsetAccount', 'RedrawFacility', 'Fee', 'Feature', 'Condition'],
  creditCards: ['CompanyCreditCard', 'CreditCard', 'CreditCardSpecial', 'Redemption', 'PartnerConversion', 'Program', 'RedemptionType', 'RedemptionName'],
  personalLoans: ['CompanyPersonalLoan', 'PersonalLoan', 'PersonalLoanSpecial', 'PersonalLoanVariation'],
  savingsAccounts: ['CompanySavingsAccount', 'SavingsAccount', 'SavingsAccountSpecial', 'SavingsAccountTier'],
  sponsoredLinks: 'SponsoredLink',
  featuredProducts: 'FeaturedProduct',
  saleEventProducts: ['SaleEventProduct', 'SaleEventProductField'],
  feeds: ['ProductFeedInclusion', 'ProductFeed', 'WidgetImage'],
  users: 'users',
  utilites: ['ApiKey', 'Monetize', 'ChangeLog'],
})

keystone.set('cors allow origin', true)

keystone.start()
