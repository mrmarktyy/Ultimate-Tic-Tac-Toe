require('dotenv').config()
const mongoose = require('mongoose')
const logger = require('./logger')

let connect = function () {
  return new Promise((resolve, reject) => {
    try {
      mongoose.connect(process.env.MONGO_URI)
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

module.exports = {
  connect,
}
