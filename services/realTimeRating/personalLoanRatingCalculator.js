// node services/realTimeRating/personalLoanRatingCalculator.js
const json2csv = require('json2csv')
const awsUploadToS3 = require('../../utils/awsUploadToS3')
const moment = require('moment')
const redshiftQuery = require('../../utils/ratecityRedshiftQuery')
const realtimeSwiftAPI = require('../../utils/realtimeSwiftAPI')

const RTRFilters = {
    'Personal Loans': [
      {loanAmount: 20000, months: 36},
    ],
    'Car Loans': [
      {loanAmount: 20000, months: 36},
      {loanAmount: 30000, months: 60},
    ],
  }

async function processRedshiftPersonalLoans (vertical, dateRange = {}) {
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
      for (let i = 0; RTRFilters[vertical].length > i; i++) {
        let filters = RTRFilters[vertical][i]
        products = await pullProducts(vertical, currentDateString, filters)
        products = transformRTRProducts(products)
        let rtrProducts = await realtimeSwiftAPI(vertical, filters.loanAmount, filters.months, products)
        rtrProducts = makeLeaderboardCompliant(vertical, currentDateString, filters.loanAmount, filters.months, rtrProducts)
        realTimeRatings.push(...rtrProducts)
      }
      currentDate.add(1, 'day')
    }
    console.log('number of products ' + realTimeRatings.length)
    if (realTimeRatings.length) {
      let status = await insertIntoRedshift(vertical, startDate, endDate, realTimeRatings)
    }
    console.log('Finished Run')
    return
  } catch (error) {
    console.log(error)
  }
}

async function insertIntoRedshift (vertical, startDate, endDate, rows) {
  if (rows.length > 0) {
    let filename = getFileName(vertical, startDate, endDate)
    let table = 'personal_loans_ratings_history'
    let head = headers(rows[0])
    let csv = json2csv({data: rows, fields: head, hasCSVColumnTitle: false})
    let filepath = `personal-loans-ratings-history/${process.env.REDSHIFT_DATABASE}/${filename}.csv`
    await awsUploadToS3(filepath, csv, 'redshift-2node')

    let command = `delete from ${table} where collectionDate between $1 and $2 and vertical = $3`
    await redshiftQuery(command, [startDate, endDate, vertical])
    command = `copy ${table} from 's3://redshift-2node/${filepath}' credentials 'aws_access_key_id=${process.env.S3_KEY};aws_secret_access_key=${process.env.S3_SECRET}' NULL AS 'null' CSV ACCEPTINVCHARS TRUNCATECOLUMNS`
    await redshiftQuery(command)
  }
}

function headers (record) {
  let header = Object.keys(record)
  return header
}

async function pullProducts (vertical, collectionDate, filters) {
  let verticalClause = vertical === 'Personal Loans' ? `and pl.ispersonalloan = 'YES'` : `and pl.iscarloan = 'YES'`

  let command = `
    select pl.*, v.*, 
    v.applicationfeesdollar as applicationfeesdollar,
    v.applicationfeespercent as varapplicationfeespercent
    from personal_loans_history pl
    inner join personal_loans_variations_history v
     on pl.uuid = v.uuid
     and v.collectiondate = '${collectionDate}'
    where pl.isdiscontinued = false
    and pl.collectiondate = '${collectionDate}'
    ${verticalClause}
    and v.maxloanamount >= ${filters.loanAmount}
    and v.minloanamount <= ${filters.loanAmount}
    and v.maxloanterm >= ${filters.months}
  `

  return await redshiftQuery(command, [])
}

function transformRTRProducts (products) {
  return products.map((product) => {
    return {
      uuid: product.uuid,
      productname: product.description,
      companyuuid: product.companyid,
      companyname: product.companyname,
      variationuuid: product.variationuuid,
      minRate: product.minrate,
      maxRate: product.maxrate,
      introRate: product.introrate,
      introTerm: product.introterm,
      ongoingFees: product.ongoingfees,
      ongoingFeesFrequency: product.ongoingfeesfrequency,
      applicationFeesDollar: product.varapplicationfeesdollar ? product.varapplicationfeesdollar : product.applicationfeesdollar,
      applicationFeesPercentage: product.varapplicationfeespercent ? product.varapplicationfeespercent : product.applicationfeespercent,
      encumberanceCheckFees: product.encumbrancecheckfees,
      docReleaseFees: product.docreleasefees,
      otherFees: product.otherfees,
      applyInBranch: product.applyinbranch === 'YES',
      applyOnline: product.applyonline === 'YES',
      applyByMobileLender: product.applybymobilelender === 'YES',
      applyByPhone: product.applybyphone === 'YES',
      applyByBroker: product.applybybroker === 'YES',
      instantApproval: product.instantapproval === 'YES',
      timeToFunding: product.timetofunding === 'YES',
      maxLoanAmount: product.maxloanterm,
      isSecuredByVehicle: product.issecuredbyvehicle === 'YES',
      isSecuredByProperty: product.issecuredbyproperty === 'YES',
      isSecuredByDeposit: product.issecuredbydeposit === 'YES',
      securedByOthers: product.securedbyothers === 'YES',
      isExtraRepaymentsAllowed: product.isextrarepaymentsallowed === 'YES',
      repaymentFrequency: product.repaymentfreq,
      hasRedrawFacility: product.hasredrawfacility === 'YES',
      hasEarlyExitPenalty: product.hasearlyexitpenalty === 'YES',
    }
  })
}

function makeLeaderboardCompliant (vertical, collectionDate, loanAmount, loanTermMonths, products) {
  return products.map((product) => {
    return {
      vertical: vertical,
      collectiondate: collectionDate,
      userloanamount: loanAmount,
      loantermmonths: loanTermMonths,
      uuid: product.uuid,
      variationuuid: product.variationuuid,
      companyuuid: product.companyuuid,
      averagemonthlycost: product.averageMonthlyCost,
      costrating: product.costRating,
      flexibilityscore: product.flexScore,
      flexibilityrating: product.flexRating,
      overallrating: product.overallRating,
    }
  })
}

function getFileName (vertical, startDate, endDate) {
  let verticalPrefix = vertical.replace(/\s+/g, '_').toLowerCase()
  let filename = ''
  if (startDate === endDate) {
    filename = `${verticalPrefix}_ratings_history_${startDate}`
  } else {
    filename = `${verticalPrefix}_ratings_history_${startDate}_${endDate}`
  }
  return filename
}

async function runRTR () {
  let current = moment('2019-06-01')
  let endDate = moment().subtract(1, 'day').format('YYYY-MM-DD')
  while (current.isSameOrBefore(endDate)) {
    let enddt = current.clone().endOf('month')
    console.log(current.format('YYYY-MM-DD'))
    enddt = enddt.isSameOrBefore(endDate) ? enddt.format('YYYY-MM-DD') : endDate
    await processRedshiftPersonalLoans('Personal Loans', {startDate: current.format('YYYY-MM-DD'), endDate: enddt})
    await processRedshiftPersonalLoans('Car Loans', {startDate: current.format('YYYY-MM-DD'), endDate: enddt})
    current = current.add(1, 'month')
  }
  console.log('ended RTR')
  return(0)
}

// runRTR()

module.exports = processRedshiftPersonalLoans