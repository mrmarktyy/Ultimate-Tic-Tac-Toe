var Mailer = require('../utils/mailer')
const keystone = require('keystone')
const ALLVERTICALS = require('../models/helpers/salesforceVerticals')

const redshiftQuery = require('../utils/redshiftQuery')
const _ = require('lodash')
const moment = require('moment')
const json2csv = require('json2csv')
const fs = require('fs')
const filePath = '/tmp/'

exports.monthlyClicksMail = async function ({month, year}) {
  let attachments = []
	let dt = moment(`1-${month}-${year}`, 'DD-MMM-YYYY')
	let startdate = dt.format('YYYY-MM-DD')
	let enddate = dt.add(1, 'months').format('YYYY-MM-DD')

  let csv = await monthlyClicksCsv(startdate, enddate)
  let fileName = `monthly-clicks-${month}-${year}.csv`
  fs.writeFileSync(filePath + fileName, csv)
  attachments.push({path: `${filePath}${fileName}`})
  let mailer = new Mailer({
    to: 'rochelle.dicristo@ratecity.com.au',
    attachments: attachments,
    subject: `Finance Month End Clicks Report for ${month} ${year}`,
    cc: 'ian.fletcher@ratecity.com.au',
  })

  await mailer.sendEmail()
}

var monthlyClicksCsv = exports.monthlyClicksCsv = async function (fromDate, toDate) {
  let command = `
    select substring((a.datetime::date), 1, 10) as click_date, a.channel, a.utm_source, a.utm_medium, a.utm_campaign,
    a.vertical, a.product_uuid as uuid, count(1)
    from apply_clicks a
    where a.datetime >= $1 and a.datetime < $2
    group by click_date, a.channel, a.utm_source, a.utm_medium, a.utm_campaign, a.vertical, a.product_uuid
    order by click_date, a.product_uuid
  `
  let rows = await redshiftQuery(command, [fromDate, toDate])
  let productsObj = await getProducts()

  rows = rows.map((row) => {
    row.company_name = null
    row.name = null
    if (productsObj[row.uuid]) {
      row.company_name = productsObj[row.uuid].company.name
      row.name = productsObj[row.uuid].name
    }
    return row
  })
  return json2csv({data: rows})
}

async function getProducts () {
  let records = []
  for (let vertical in ALLVERTICALS) {
    let {collection, findClause} = ALLVERTICALS[vertical]
    let model = await keystone.list(collection).model // eslint-disable-line babel/no-await-in-loop
    let productClause = findClause || {}
    records = records.concat(await model.find(productClause).populate('company').lean().exec()) // eslint-disable-line babel/no-await-in-loop
  }
  let recordsObj = records.reduce((result, product) =>{
    result[product.uuid] = product
    return result
  }, {})
  return recordsObj
}
