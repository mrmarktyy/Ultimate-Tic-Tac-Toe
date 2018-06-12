require('dotenv').config()

const logger = require('../../utils/logger')
var mongoosePromise = require('../../utils/mongoosePromise')
const moment = require('moment')
const filePath = '/tmp/'
var Mailer = require('../../utils/mailer')
const badslugs = require('./dataReportAttachments/badslugs')
const noProviderProductName = require('./dataReportAttachments/noProviderProductName')
const noCompanyInFundgroup = require('./dataReportAttachments/noCompanyInFundgroup')
const noRedshiftHistory = require('./dataReportAttachments/noRedshiftHistory')

async function dataReport () {
  let connection = await mongoosePromise.connect()
  try {
    let attachments = []
    attachments.push(await badslugs(filePath))
    attachments.push(await noProviderProductName(filePath))
    attachments.push(await noCompanyInFundgroup(filePath))
    attachments.push(await noRedshiftHistory(filePath))
    attachments = attachments.filter((a) => { return a !== null })
    emailDataTeam(attachments)

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
    html: '<p>Data report errors in csv attachments. If no csv files, then there are no errors. The missing redshift data checks from 30 days ago.</p>',
  })

  await mailer.sendEmail()
}

module.exports = dataReport
