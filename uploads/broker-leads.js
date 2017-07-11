require('dotenv').config()
var mongoose = require('mongoose')
var removeUneededFields = require('../utils/removeUneededFields')
var logger = require('../utils/logger')
const json2csv = require('json2csv')
var _ = require('lodash')
var fs = require('fs')

module.exports = async function () {
  let connection = await connect()
  try {
    let schema = mongoose.Schema()
    let users = mongoose.model('users', schema)

    let leadsData = await users.find().lean().exec()

    let brokerLeads = leadsData.filter((item) => {
      return item.data && item.data.leads
    }).map((item) => {
      return item.data.leads
    })

    let leads = []

    brokerLeads.forEach((item) => {
      let keys = Object.keys(item)

      keys.forEach((key) => {
        leads.push(item[key])
      })
    })

    let result = leads.filter((item) => item.type === 'basicLead').map((item) => {
      item = removeUneededFields(item, ['product'])

      for (let key in item.user) {
        item[key] = item.user[key]
      }

      item = _.omit(item, ['user'])
      return item
    })
    let csv = json2csv({data: result, hasCSVColumnTitle: true})

    fs.writeFileSync('tmp/brokerleads.csv', csv)
    connection.close()
  } catch (error) {
    logger.error(error)
    return error
  }
}()

function connect () {
  return new Promise((resolve, reject) => {
    try {
      mongoose.connect(process.env.MONGO_USERS_URI)
      let connection = mongoose.connection

      connection.once('open', (error) => {
        if (error) {
          logger.error(error)
        }
        resolve(connection)
      })
    } catch (error) {
      reject()
    }
  })
}
