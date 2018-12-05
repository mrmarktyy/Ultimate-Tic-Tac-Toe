// node services/realTimeRating/homeLoanRatingCalculator.js
// dont go over a month in one session
// manual run out this code at the bottom of the page.
// processRedshiftHomeLoans({startDate: '2018-08-01', endDate: '2018-08-31'})
const calculateFlexScore = require('./calculateFlexScore')
const calculateAvgMonthlyCost = require('./calculateAvgMonthlyCost')
const calculateFlexRating = require('./calculateFlexRating')
const calculateCostRating = require('./calculateCostRating')

const json2csv = require('json2csv')
const awsUploadToS3 = require('../../utils/awsUploadToS3')
const moment = require('moment')
const redshiftQuery = require('../../utils/ratecityRedshiftQuery')

const USER_LOAN_TERM_IN_MONTHS = 60

async function processRedshiftHomeLoans (dateRange = {}) {
  try {
    let {
      startDate = moment().format('YYYY-MM-DD'),
    } = dateRange
    let { endDate = startDate } = dateRange
    if (moment(startDate) > moment(endDate)) {
      throw('Start date has to be less than or equal to end date PROCESS STOPPED')
    }
    console.log(`started homeloan ratings history ${startDate} - ${endDate}`)
    let products = []
    let realTimeRatings = []

    const LOAN_AMOUNT_SERIES = loanAmountSeries()
    let currentDate = moment(startDate)
    while (currentDate.isSameOrBefore(moment(endDate))) {
      let currentDateString = currentDate.format('YYYY-MM-DD')
      products = await pullProducts(currentDateString)
      for (let i = 0; LOAN_AMOUNT_SERIES.length > i; i++) {
        let ratingSeries = await calculateProductRating(currentDateString, products, USER_LOAN_TERM_IN_MONTHS, LOAN_AMOUNT_SERIES[i])
        realTimeRatings.push(...ratingSeries)
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

function calculateProductRating (currentDate, products, userLoanTermInMonth, userLoanAmount) {
  let minFlexibility = 99999999
  let maxFlexibility = 0
  let lowestMonthlyCostDefault = 99999999
  let lowestMonthlyCostIO = 99999999

  let filteredProducts = products.filter((product) => (product.mintotalloanamount <= userLoanAmount && product.maxtotalloanamount >= userLoanAmount))
//  let remainingProducts = products.filter((product) => !(product.mintotalloanamount <= userLoanAmount && product.maxtotalloanamount >= userLoanAmount))
  let realTimeProducts = []
  filteredProducts.forEach((product) => {
    let data = parseProductData(product)
    let flexibility = calculateFlexScore(product)

    data.loanTermInMonth = 360
    data.loanAmount = userLoanAmount

    let record = {
      collectiondate: currentDate,
      uuid: product.uuid,
      variationUuid: product.variationuuid,
      userLoanAmount: userLoanAmount,
      defaultAverageMonthlyCost: null,
      defaultCostRating: null,
      ioAverageMonthlyCost: null,
      ioCostRating: null,
      flexibilityScore: flexibility,
      flexibilityRating: null,
      interestOnly: data.interestOnly,
      principalAndInterest: data.principalAndInterest,
    }

    if (data.interestOnly && data.principalAndInterest) {
      const avgMonthlyCostIO = calculateAvgMonthlyCost(data, userLoanTermInMonth, 'IO')
      const avgMonthlyCostPI = calculateAvgMonthlyCost(data, userLoanTermInMonth, 'PI')

      lowestMonthlyCostIO = Math.min(avgMonthlyCostIO, lowestMonthlyCostIO)
      lowestMonthlyCostDefault = Math.min(lowestMonthlyCostDefault, avgMonthlyCostIO, avgMonthlyCostPI)

      record.defaultAverageMonthlyCost = avgMonthlyCostPI
      record.ioAverageMonthlyCost = avgMonthlyCostIO
    }

    if (data.interestOnly && !data.principalAndInterest) {
      const avgMonthlyCostIO = calculateAvgMonthlyCost(data, userLoanTermInMonth, 'IO')
      lowestMonthlyCostIO = Math.min(avgMonthlyCostIO, lowestMonthlyCostIO)

      record.defaultAverageMonthlyCost = avgMonthlyCostIO
      record.ioAverageMonthlyCost = avgMonthlyCostIO
    }

    if (data.principalAndInterest && !data.interestOnly) {
      const avgMonthlyCostPI = calculateAvgMonthlyCost(data, userLoanTermInMonth, 'PI')
      lowestMonthlyCostDefault = Math.min(lowestMonthlyCostDefault, avgMonthlyCostPI)

      record.defaultAverageMonthlyCost = avgMonthlyCostPI
      record.ioAverageMonthlyCost = avgMonthlyCostPI
    }
    realTimeProducts.push(record)
    maxFlexibility = Math.max(flexibility, maxFlexibility)
    minFlexibility = Math.min(flexibility, minFlexibility)
  })

  for (let i=0; realTimeProducts.length > i; i++) {
    if (!realTimeProducts[i].interestOnly && realTimeProducts[i].principalAndInterest) {
      realTimeProducts[i].defaultCostRating = calculateCostRating(realTimeProducts[i].defaultAverageMonthlyCost, lowestMonthlyCostDefault)
    } else {
      realTimeProducts[i].defaultCostRating = calculateCostRating(realTimeProducts[i].defaultAverageMonthlyCost, lowestMonthlyCostDefault)
      realTimeProducts[i].ioCostRating = calculateCostRating(realTimeProducts[i].ioAverageMonthlyCost, lowestMonthlyCostIO)
    }
    realTimeProducts[i].flexibilityRating = calculateFlexRating(realTimeProducts[i].flexibilityScore, maxFlexibility, minFlexibility)
  }
  return realTimeProducts
}

function parseProductData (product) {
  let monthlyRate
  let monthlyIntroRate
  let introTermInMonth
  let fixedRate
  let fixedTermInMonth
  let fixedLoan = false
  let introLoan = false

  if (product.homeloantype === 'VARIABLE') {
    monthlyRate = product.revertrate ? product.revertrate / 100 / 12 : product.rate / 100 / 12
    introTermInMonth = product.introductoryterm ? product.introductoryterm : 0
    monthlyIntroRate = product.introductoryrate ? parseFloat(product.introductoryrate) / 100 / 12 : 0
  } else {
    const fixedLoanPeriod = product.fixmonth
    monthlyRate = product.revertrate / 100 / 12
    fixedRate = product.rate / 100 / 12
    fixedTermInMonth = fixedLoanPeriod
    fixedLoan = true
  }

  if (monthlyIntroRate) {
    introLoan = true
  }

  let legalFee = product.legalfee ? parseFloat(product.legalfee) : 0
  let valuationFee = product.valuationfee ? parseFloat(product.valuationfee) : 0
  let settlementFee = product.settlementfee ? product.settlementfee : 0
  let applicationFee = product.applicationfee ? product.applicationfee : 0
  let totalUpfrontFees = legalFee + valuationFee + settlementFee + applicationFee
  let totalMonthlyFees = 0
  let totalYearlyFees = 0
  let ongoingFeeFrequency = product.introongoingfeesfrequency || product.revertongoingfeefreqency || ''
  // ongoingFeeFrequency  = ongoingFeeFrequency ? ongoingFeeFrequency[0].toUpperCase() + ongoingFeeFrequency.slice(1) : ongoingFeeFrequency

  let periodFee = product.introongoingfees === product.revertongoingfees ? parseInt(product.introongoingfees) : parseInt(product.revertongoingfees)
  if (ongoingFeeFrequency === 'MONTHLY') {
    totalMonthlyFees = periodFee
  }
  if (ongoingFeeFrequency === 'ANNUALLY') {
    totalYearlyFees = periodFee
  }
  let totalEndOfLoanFees = product.dischargefee ? parseFloat(product.dischargefee) : 0

  let data = {
    monthlyRate,
    fixedRate,
    fixedTermInMonth,
    introTermInMonth,
    monthlyIntroRate,
    totalUpfrontFees,
    totalMonthlyFees,
    totalYearlyFees,
    totalEndOfLoanFees,
    introductoryRate: parseFloat(product.introductoryrate),
    interestOnly: product.hasinterestonly,
    principalAndInterest: product.hasprincipalandinterest,
    fixedLoan,
    introLoan,
    uuid: product.variationuuid,
  }

  return data
}

async function pullProducts (collectionDate) {
  let command = `
    select * from home_loans_history where collectionDate = $1
    and isDiscontinued = false
  `
  return await redshiftQuery(command, [collectionDate])
}

function loanAmountSeries () {
  let loanAmounts = []
  for (var i = 150000; i <= 1000000; i = i + 50000) {
    loanAmounts.push(i)
  }

  return loanAmounts
}

async function insertIntoRedshift (startDate, endDate, rows) {
  if (rows.length > 0) {
    let filename = getFileName(startDate, endDate)
    let table = 'home_loans_ratings_history'
    let head = headers(rows[0])
    let csv = json2csv({data: rows, fields: head, hasCSVColumnTitle: false})
    let filepath = `home-loans-ratings-history/${process.env.REDSHIFT_DATABASE}/${filename}.csv`
    await awsUploadToS3(filepath, csv, 'redshift-2node')

    let command = `delete from ${table} where collectionDate between $1 and $2`
    await redshiftQuery(command, [startDate, endDate])
    command = `copy ${table} from 's3://redshift-2node/${filepath}' credentials 'aws_access_key_id=${process.env.S3_KEY};aws_secret_access_key=${process.env.S3_SECRET}' NULL AS 'null' CSV ACCEPTINVCHARS TRUNCATECOLUMNS`
    await redshiftQuery(command)
  }
}

function headers (record) {
  let header = Object.keys(record)
  header.pop()
  header.pop()
  return header
}

function getFileName (startDate, endDate) {
  let filename = ''
  if (startDate === endDate) {
    filename = `home_loans_ratings_history_${startDate}`
  } else {
    filename = `home_loans_ratings_history_${startDate}_${endDate}`
  }
  return filename
}

async function rollingDelete (collectionDate, days = 150) {
  let lastActiveDay = moment(collectionDate).subtract(days, 'days').format('YYYY-MM-DD')
  let command = `delete from home_loans_ratings_history where collectionDate < $1`
  await redshiftQuery(command, [lastActiveDay])
}

module.exports = {
  processRedshiftHomeLoans,
  rollingDelete,
}
