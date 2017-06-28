var Mailer = require('../utils/mailer')
const redshiftQuery = require('../utils/redshiftQuery')
const _ = require('lodash')
const moment = require('moment')
const json2csv = require('json2csv')
const fs = require('fs')
const filePath = '/tmp/'

module.exports = async function ({month, year}) {
  let dt = moment(`1-${month}-${year}`, 'DD-MMM-YYYY')
  let startdate = dt.format('YYYY-MM-DD')
  let enddate = dt.add(1, 'months').format('YYYY-MM-DD')
  let command = `
    select a.utm_source, a.vertical, a.product_uuid as uuid, sf.name, sf.company_name, count(1)
    from apply_clicks a
    LEFT JOIN
      (SELECT * from salesforce_products sales where sales.date_start >= $1 and sales.date_end < $2 and inserted_at =
          (select distinct max(inserted_at) from salesforce_products innersales where innersales.uuid = sales.uuid
          and innersales.date_start >= $1 and innersales.date_end < $2)) as sf ON
      sf.uuid = a.product_uuid
    where a.datetime >= $1 and a.datetime < $2
    group by a.utm_source, a.vertical, a.product_uuid, sf.name, sf.company_name
    order by a.product_uuid
  `
  let rows = await redshiftQuery(command, [startdate, enddate])

  let csv = json2csv({data: rows})
  let fileName = `monthly-clicks-${month}-${year}.csv`
  fs.writeFileSync(filePath + fileName, csv)
  let attachment = {path: `${filePath}${fileName}`}
  let mailer = new Mailer({
    to: 'rochelle.dicristo@ratecity.com.au',
    attachment: attachment,
    subject: `Finance Month End Clicks Report for ${month} ${year}`,
    cc: 'ian.fletcher@ratecity.com.au',
  })

  await mailer.sendEmail()
}

