// node services/realTimeRating/termDepositsRatingCalculator.js
const json2csv = require('json2csv')
const awsUploadToS3 = require('../../utils/awsUploadToS3')
const moment = require('moment')
const redshiftQuery = require('../../utils/ratecityRedshiftQuery')
const realtimeSwiftAPI = require('../../utils/realtimeSwiftAPI')

const RTRFilters = [
	{deposit: 50000, term: 12}, // Best term deposit: under 12 months
	{deposit: 250000, term: 12}, // Best term deposit: under 12 months
  {deposit: 50000, term: 36}, // Best term deposit: 3 years
  {deposit: 250000, term: 36}, // Best term deposit: 3 years
  {deposit: 50000, term: 60}, // Best term deposit: 5 years
  {deposit: 250000, term: 60}, // Best term deposit: 5 years
]

async function processRedshift (dateRange = {}) {
	const vertical = 'Term Deposits'
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
      for (let i = 0; RTRFilters.length > i; i++) {
        let filters = RTRFilters[i]
        products = await pullProducts(currentDateString, filters)
        products = transformRTRProducts(products)
        let rtrProducts = await realtimeSwiftAPI(vertical, {
					termDepositAmount: filters.deposit,
					term: filters.term,
				}, products)
        rtrProducts = makeLeaderboardCompliant(currentDateString, filters.deposit, filters.term, rtrProducts)
        realTimeRatings.push(...rtrProducts)
      }
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
    let table = 'term_deposits_ratings_history'
    let head = headers(rows[0])
    let csv = json2csv({data: rows, fields: head, hasCSVColumnTitle: false})
    let filepath = `td-ratings-history/${process.env.REDSHIFT_DATABASE}/${filename}.csv`
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

async function pullProducts (collectionDate, filters) {
  let command = `
    select t.*, v.*
    from term_deposits_history t
    inner join term_deposits_tiers_history v
     on t.uuid = v.termdeposituuid
     and v.collectiondate = '${collectionDate}'
    where t.isdiscontinued = false
    and t.collectiondate = '${collectionDate}'
    and v.maximumdeposit >= ${filters.deposit}
    and v.minimumdeposit <= ${filters.deposit}
    and v.term = ${filters.term}
  `

  return await redshiftQuery(command, [])
}

function transformRTRProducts (products) {
  return products.map((product) => {
    return {
			uuid: product.uuid,
			productname: product.description,
			companyuuid: product.companyuuid,
			companyname: product.companyname,
			variationuuid: product.variationuuid,

			interestPaymentFrequencyTerm: product.interestpaymentfrequencyterm,
			interestRate: product.interestrate,
			term: product.term,
			jointApplicationAvailable: product.jointapplicationavailable,
			noticePeriodToWithdraw: product.noticeperiodtowithdraw,
			maturityAlertByEmail: product.maturityalertbyemail,
			maturityAlertByPhone: product.maturityalertbyphone,
			automaticMaturityRollover: product.automaticmaturityrollover,
			interestPaymentViaOtherInstitution: product.interestpaymentviaotherinstitution,
			earlyWithdrawalPenalty: product.earlywithdrawalavailable,
    }
  })
}

function makeLeaderboardCompliant (collectionDate, deposit, term, products) {
  return products.map((product) => {
    return {
      collectiondate: collectionDate,
      deposit: deposit,
      term: term,
      uuid: product.uuid,
      variationuuid: product.variationuuid,
      companyuuid: product.companyuuid,
      avgmonthlyinterest: product.avgMonthlyInterest,
      costrating: product.costRating,
      flexibilityscore: product.flexScore,
      flexibilityrating: product.flexRating,
      overallrating: product.overallRating,
    }
  })
}

function getFileName (startDate, endDate) {
  let filename = ''
  if (startDate === endDate) {
    filename = `td_ratings_history_${startDate}`
  } else {
    filename = `td_ratings_history_${startDate}_${endDate}`
  }
  return filename
}

async function runRTR () {
  let current = moment('2019-12-01')
  // let current = moment('2020-02-16')
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
