// node services/realTimeRating/savingsAccountRatingCalculator.js
const json2csv = require('json2csv')
const _ = require('lodash')
const awsUploadToS3 = require('../../utils/awsUploadToS3')
const moment = require('moment')
const redshiftQuery = require('../../utils/ratecityRedshiftQuery')
const realtimeSwiftAPI = require('../../utils/realtimeSwiftAPI')

const RTRFilters = [
	{initialDeposit: 10000, period: 12, monthlyDeposit: 600}, // Best savings account for regular savers
	{initialDeposit: 10000, period: 24, monthlyDeposit: 600}, // Best savings account for regular savers
	{initialDeposit: 10000, period: 12, monthlyDeposit: 0}, // Best standard savings account (unconditional)
	{initialDeposit: 10000, period: 24, monthlyDeposit: 0}, // Best standard savings account (unconditional)
]

async function processRedshift (vertical, dateRange = {}) {
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
				const filters = RTRFilters[i]
				products = await pullProducts(currentDateString, filters)
				let rtrProducts = await realtimeSwiftAPI(vertical, RTRFilters, products)
				rtrProducts = makeLeaderboardCompliant(currentDateString, filters.initialDeposit, filters.monthlyDeposit, filters.period,  rtrProducts)
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
    let table = 'savings_accounts_ratings_history'
    let head = headers(rows[0])
    let csv = json2csv({data: rows, fields: head, hasCSVColumnTitle: false})
    let filepath = `sa-ratings-history/${process.env.REDSHIFT_DATABASE}/${filename}.csv`
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
  const command = `
    select sa.*, v.*
    from savings_accounts_history sa
    inner join savings_accounts_tiers_history v
     on sa.uuid = v.productuuid
     and v.collectiondate = '${collectionDate}'
    where v.isdiscontinued = false
    and sa.collectiondate = '${collectionDate}'
		and v.maximumamount >= ${filters.initialDeposit}
    and v.minimumamount <= ${filters.initialDeposit}
  `
  const data = await redshiftQuery(command, [])
	const products = []
	_.forEach(data, d => {
		let prod = _.find(products, {uuid: d.uuid})
		if (!prod) {
			prod = {
				uuid: d.uuid,
				name: d.name,
				slug: d.slug,
				companyName: d.companyname,
				companyUuid: d.companyuuid,
				interestCalculationMethod: d.interestcalculationmethod,
				accountKeepingFees: d.accountkeepingfees,
				hasAtmAccess: d.hasatmaccess,
				hasEftposFacility: d.haseftposfacility,
				hasInternetFacility: d.hasinternetfacility,
				hasPhoneFacility: d.hasphonefacility,
				hasBranchAccess: d.hasbranchaccess,
				jointApplicationAvailable: d.jointapplicationavailable,
				unlimitedWithdrawals: d.unlimitedwithdrawals,
				internetTransactionFee: d.internettransactionfee,
				phoneTransactionFee: d.phonetransactionfee,
				eftposFee: d.eftposfee,
				overseasEftposFee: d.overseaseftposfee,
				overTheCounterDepositFee: d.overthecounterdepositfee,
				overTheCounterWithdrawalFee: d.overthecounterwithdrawalfee,
				atmWithdrawalFee: d.atmwithdrawalfee,
				variations: [],
			}
			products.push(prod)
		}
		prod.variations.push({
			baseRate: d.baserate,
			bonusRate: d.bonusrate,
			introductoryRate: d.introductoryrate,
			introductoryRateTerm: d.introductoryrateterm,
			tierAmount: d.tieramount,
			interestAccrued: d.interestaccrued,
			maximumAmount: d.maximumamount,
			minimumAmount: d.minimumamount,
		})
	})
	return products
}

function makeLeaderboardCompliant (collectionDate, initialDeposit, monthlyDeposit, period, products) {
  return products.map((product) => {
    return {
      collectiondate: collectionDate,
			initialdeposit: initialDeposit,
			monthlydeposit: monthlyDeposit,
			monthlyPeriod: period,
      uuid: product.uuid,
      companyuuid: product.companyUuid,
			totalinterestearned: product.totalInterestEarned,
			withinlimit: product.withinLimit,
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
    filename = `sa_ratings_history_${startDate}`
  } else {
    filename = `sa_ratings_history_${startDate}_${endDate}`
  }
  return filename
}

async function runRTR () {
  let current = moment('2019-06-01')
	// let current = moment('2020-02-16')
  let endDate = moment().subtract(1, 'day').format('YYYY-MM-DD')
  while (current.isSameOrBefore(endDate)) {
    let enddt = current.clone().endOf('month')
    console.log(current.format('YYYY-MM-DD'))
    enddt = enddt.isSameOrBefore(endDate) ? enddt.format('YYYY-MM-DD') : endDate
    await processRedshift('Savings Accounts', {startDate: current.format('YYYY-MM-DD'), endDate: enddt})
    current = current.add(1, 'month')
  }
  console.log('ended RTR')
  return(0)
}

// runRTR()

module.exports = processRedshift
