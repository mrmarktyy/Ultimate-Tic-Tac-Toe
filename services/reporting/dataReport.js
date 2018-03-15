require('dotenv').config()

const logger = require('../../utils/logger')
var mongoosePromise = require('../../utils/mongoosePromise')
var keystoneShell = require('../../utils/keystoneShell')
const productService = require('../productService')
const json2csv = require('json2csv')
const moment = require('moment')
const fs = require('fs')
const filePath = '/tmp/'
var Mailer = require('../../utils/mailer')

const ALL_SPECIALS = [
  'CreditCardSpecial', 'HomeLoanSpecial', 'PersonalLoanSpecial',
  'SavingsAccountSpecial', 'TermDepositSpecial',
]

async function dataReport () {
  let connection = await mongoosePromise.connect()
  try {
    let attachment
    attachment = await badslugs()
    if (attachment) {
      emailDataTeam([attachment])
    }
    connection.close()
  } catch (error) {
    logger.error(error)
    connection.close()
    return error
  }

}

async function badslugs () {
  let collections = await productService({slug: /.*-duplicate/}, {isDiscontinued: 1})
  let slugs = []
  for (let vertical in collections) {
    let products = collections[vertical]
    for (let i = 0; i < products.length; i++) {
      let product = products[i]
      let obj = {
        vertical: vertical,
        company: product.company.name,
        name: product.name,
        uuid: product.uuid,
        slug: product.slug,
        isDiscontinued: product.isDiscontinued,
      }
      slugs.push(obj)
    }
  }

  slugs = slugs.concat(await specialsBadSlug())
  let result = null
  if (slugs.length) {
    let csv = json2csv({data: slugs})
    let fileName = `bad-slugs.csv`
    fs.writeFileSync(filePath + fileName, csv)
    result =  {path: `${filePath}${fileName}`}
  }
  return result
}

async function emailDataTeam (attachments) {
  let dt = moment().format('DD-MMM-YYYY')
  let mailer = new Mailer({
    to: 'data@ratecity.com.au',
    attachments: attachments,
    subject: `Ultimate Data Errors Report ${dt}`,
    cc: 'ian.fletcher@ratecity.com.au',
  })

  await mailer.sendEmail()
}

async function specialsBadSlug () {
  let specials = []
  let slugs = []
  for(let i = 0; i < ALL_SPECIALS.length; i++) {
    let special = ALL_SPECIALS[i]
    let model = await keystoneShell.list(special).model // eslint-disable-line babel/no-await-in-loop
    let collection = await model.find({name: /.*duplicate/}).populate('company product').lean().exec() // eslint-disable-line babel/no-await-in-loop
    if (collection.length) {
      specials[special] = collection
    }
  }
  for (let collection in specials) {
    let items = specials[collection]
    for (let i = 0; i < items.length; i++) {
      let special = items[i]
      let obj = {
        vertical: collection,
        company: special.company.name,
        name: special.name,
        uuid: null,
        slug: special.slug,
        isDiscontinued: null,
      }
      slugs.push(obj)
    }
  }
  let result = []
  if (slugs.length) {
    result = slugs
  }
  return result
}

module.exports = dataReport
