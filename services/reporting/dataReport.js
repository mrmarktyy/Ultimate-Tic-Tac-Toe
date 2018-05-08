require('dotenv').config()

const logger = require('../../utils/logger')
var mongoosePromise = require('../../utils/mongoosePromise')
const moment = require('moment')
const filePath = '/tmp/'
var Mailer = require('../../utils/mailer')
const badslugs = require('./dataReportAttachments/badslugs')
const noProviderProductName = require('./dataReportAttachments/noProviderProductName')
const noCompanyInFundGroup = require('./dataReportAttachments/noCompanyInFundGroup')

async function dataReport () {
  let connection = await mongoosePromise.connect()
  try {
    let attachments = []
    attachments.push(await badslugs(filePath))
    attachments.push(await noProviderProductName(filePath))
    attachments.push(await noCompanyInFundGroup(filePath))
    attachments = attachments.filter((a) => { return a !== null })
    if (attachments.length) {
      emailDataTeam(attachments)
    }
    connection.close()
  } catch (error) {
    logger.error(error)
    connection.close()
    return error
  }

}

async function emailDataTeam (attachments) {
  let dt = moment().format('DD-MMM-YYYY')
  let mailer = new Mailer({
    to: 'data@ratecity.com.au',
    attachments: attachments,
    subject: `Ultimate Data Errors Report ${dt}`,
    cc: 'ian.fletcher@ratecity.com.au',
    html: '<p>Data report csv attachments</p>',
  })

  await mailer.sendEmail()
}

module.exports = dataReport
