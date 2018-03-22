var keystone = require('keystone')
var changeLogService = require('../../services/changeLogService')
var Types = keystone.Field.Types
var CryptoJs = require('crypto-js')

var ExternalApi = new keystone.List('ExternalApi', {
    track: true,
})

ExternalApi.add({
  apiType: { type: Types.Select, options: ['Personalised Rates'], required: true, initial: true },
  apiClient: { type: Types.Text, initial: true, index: true },
	apiEndpoint: { type: Types.Text, initial: true, index: true },
  apiKey: { type: Types.Text, initial: true, index: true },
	apiSecret: { type: Types.Text, initial: true, index: true },
	apiExcryptedSecret: { type: Types.Text, noedit: true },
})

ExternalApi.schema.pre('save', async function (next) {
	this.apiExcryptedSecret = CryptoJs.AES.encrypt(this.apiSecret, process.env.EXTERNAL_API_SECRET)
  await changeLogService(this)
  next()
})

ExternalApi.defaultSort = 'apiType'
ExternalApi.defaultColumns = 'apiType, apiClient, apiEndpoint, apiKey, apiSecret'
ExternalApi.searchFields = 'apiType, apiClient, apiEndpoint, apiKey, apiSecret'
ExternalApi.register()
