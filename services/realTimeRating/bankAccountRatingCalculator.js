// node services/realTimeRating/bankAccountRatingCalculator.js
const json2csv = require('json2csv')

const awsUploadToS3 = require('../../utils/awsUploadToS3')
const moment = require('moment')
const redshiftQuery = require('../../utils/ratecityRedshiftQuery')
const realtimeSwiftAPI = require('../../utils/realtimeSwiftAPI')

async function processRedshift (dateRange = {}) {
	const vertical = 'Bank Accounts'
  try {
    let {
      startDate = moment().format('YYYY-MM-DD'),
    } = dateRange
    let { endDate = startDate } = dateRange
    if (moment(startDate) > moment(endDate)) {
      throw('Start date has to be less than or equal to end date PROCESS STOPPED')
    }
    console.log(`started ${vertical.toLowerCase()} ratings history ${startDate} - ${endDate}`)
    let products = []
    let realTimeRatings = []
    let currentDate = moment(startDate)
    while (currentDate.isSameOrBefore(endDate)) {
      let currentDateString = currentDate.format('YYYY-MM-DD')

      products = await pullProducts(currentDateString)
      products = transformRTRProducts(products)
      let rtrProducts = await realtimeSwiftAPI(vertical, {}, products)
      rtrProducts = makeLeaderboardCompliant(currentDateString, rtrProducts)
      realTimeRatings.push(...rtrProducts)

      currentDate.add(1, 'day')
    }
    console.log('number of products ' + realTimeRatings.length)
    if (realTimeRatings.length) {
      let status = await insertIntoRedshift(startDate, endDate, realTimeRatings)
    }
    console.log('Finished Run')
    return
  } catch (error) {
    console.log(error)
  }
}

async function insertIntoRedshift (startDate, endDate, rows) {
  if (rows.length > 0) {
    let filename = getFileName(startDate, endDate)
    let table = 'bank_accounts_ratings_history'
    let head = headers(rows[0])
    let csv = json2csv({data: rows, fields: head, hasCSVColumnTitle: false})
    let filepath = `bank-accounts-ratings-history/${process.env.REDSHIFT_DATABASE}/${filename}.csv`
    await awsUploadToS3(filepath, csv, 'redshift-2node')

    let command = `delete from ${table} where collectionDate between $1 and $2`
    await redshiftQuery(command, [startDate, endDate])
    command = `copy ${table} from 's3://redshift-2node/${filepath}' credentials 'aws_access_key_id=${process.env.S3_KEY};aws_secret_access_key=${process.env.S3_SECRET}' NULL AS 'null' CSV ACCEPTINVCHARS TRUNCATECOLUMNS`
    await redshiftQuery(command)
  }
}

function headers (record) {
  return Object.keys(record)
}

async function pullProducts (collectionDate) {
  let command = `
    select *
    from bank_accounts_history t
    where t.isdiscontinued = false
    and t.collectiondate = '${collectionDate}'
  `
  return await redshiftQuery(command, [])
}

function transformRTRProducts (products) {
  return products.map((product) => {
    return {
			uuid: product.uuid,
			name: product.name,
			companyuuid: product.companyuuid,
			companyname: product.companyname,

      accountKeepingFee: parseFloat(product.accountkeepingfee || 0),
      minimumDepositRequiredForFeeFree: parseFloat(product.minimumdepositrequiredforfeefree || 0),
      foreignTransactionFeeDollars: parseFloat(product.foreigntransactionfeedollars || 0),
      foreignTransactionFeePercent: parseFloat(product.foreigntransactionfeepercent || 0),
      internetTransactionFee: parseFloat(product.internettransactionfee || 0),
      valueOfSpecial: parseFloat(product.valueofspecial || 0),
    }
  })
}

function makeLeaderboardCompliant (collectionDate, products) {
  return products.map((product) => {
    return {
      collectiondate: collectionDate,
      uuid: product.uuid,
      companyuuid: product.companyuuid,
      rtrscore: product.rtrScore,
      overallrating: product.overallRating,
    }
  })
}

function getFileName (startDate, endDate) {
  let filename = ''
  if (startDate === endDate) {
    filename = `bank_accounts_ratings_history_${startDate}`
  } else {
    filename = `bank_accounts_ratings_history_${startDate}_${endDate}`
  }
  return filename
}

async function runRTR () {
  // let current = moment('2019-06-01')
  let current = moment('2020-03-08')
  let endDate = moment().subtract(1, 'day').format('YYYY-MM-DD')
  while (current.isSameOrBefore(endDate)) {
    let enddt = current.clone().endOf('month')
    console.log(current.format('YYYY-MM-DD'))
    enddt = enddt.isSameOrBefore(endDate) ? enddt.format('YYYY-MM-DD') : endDate
    await processRedshift({startDate: current.format('YYYY-MM-DD'), endDate: enddt})
    current = current.add(1, 'month')
  }
  console.log('ended RTR')
  return(0)
}

// runRTR()

module.exports = processRedshift
