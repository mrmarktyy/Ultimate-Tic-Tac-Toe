require('dotenv').config()

var fetch = require('node-fetch')
const logger = require('../utils/logger')
const json2csv = require('json2csv')
const moment = require('moment')
const recommendedMultiplier = require('../utils/recommendedMultiplier').multiplier
const awsUploadToS3 = require('../utils/awsUploadToS3')
const redshiftQuery = require('../utils/ratecityRedshiftQuery')
const homeLoanRatingCalculator = require('../services/realTimeRating/homeLoanRatingCalculator')
const leaderDashBoard = require('../services/realTimeRating/leaderDashBoard.js')

module.exports = async function () {
  try {
    let homeloansJSON = await fetch(process.env.ULTIMATE_HOMELOAN_EXPORT, {
      method: 'GET',
      headers: {
         apiKey: process.env.ULTIMATE_APIKEY,
      },
    })

    let homeloans = await homeloansJSON.json()
    await prepareDataForRedshift(homeloans)

  } catch(err) {
    logger.error(err)
    return err
  }
}

async function prepareDataForRedshift (homeloans) {
  const collectionDate = moment().format('YYYY-MM-DD')
  const filename = `home_loans_history_${collectionDate}`
  let homeLoanProducts = []

  homeloans.forEach((importedProduct) => {
    let {
      variations,
      company,
      companyVertical,
      homeLoanFamily,
      offsetAccounts,
      redrawfacilities,
      fees,
      features,
      extraRepayments,
      conditions,
      isDiscontinued,
      homeLoanType,
      uuid,
      name,
      propertyPurposeTypes,
      repaymentFrequencies,
      isRCSpecial,
      repaymentTypes,
      isPackage,
      applicationOptions,
      isBasicVariable,
      isBridgingLoan,
      otherBenefits,
      otherRestrictions,
      adminNotes,
    } = importedProduct

    let states = companyVertical[0] ? companyVertical[0].states : []

    variations.forEach((variation) => {
      let product = {}
      const repaymentObj = getExtraRepayments(extraRepayments, homeLoanType)
      const redrawFacilityObj = getRedrawFacilityDetails(redrawfacilities, homeLoanType)
      const upfrontFeesObj = getUpfrontFees(fees)
      const offsetAccountObj = getOffsetAccountDetails(offsetAccounts, homeLoanType)
      const ongoingFeeObj = getOngoingFees(fees, homeLoanType)

      product.collectiondate = collectionDate
      product.isdiscontinued = isDiscontinued || false
      product.uuid = uuid
      product.variationuuid = variation.uuid
      product.createdat = variation.createdAt ? moment(variation.createdAt).format('YYYY-MM-DD HH:mm:ss') : null
      product.updatedat = variation.updatedAt ? moment(variation.updatedAt).format('YYYY-MM-DD HH:mm:ss') : null
      product.productname = name
      product.variationname = variation.name
      product.providerproductuuid = variation.providerProductName ? variation.providerProductName.uuid : null
      product.providerproductname = variation.providerProductName ? variation.providerProductName.name : null
      product.gotositeenabled = variation.gotoSiteEnabled
      product.gotositeurl = variation.gotoSiteUrl
      product.companyuuid = company.uuid
      product.companyname = company.name
      product.ecpc = variation.ecpc
      product.monthlyclicks =variation.recommendScore ? Math.round(variation.recommendScore/recommendedMultiplier) : 0
      product.supplierreference = variation.legacyCode
      product.slug = variation.slug
      product.paymenttype = variation.paymentType || 'cpc'
      product.neo4jid = variation.neo4jId
      product.homeloantype = homeLoanType
      product.comparisonrate = variation.comparisonRate || variation.calculatedComparisonRate
      product.mintotalloanamount = variation.minTotalLoanAmount || null
      product.maxtotalloanamount = variation.maxTotalLoanAmount || null
      product.annualfees = getFeeCostsWithFreq(fees, 'ONGOING_FEE', 'ANNUALLY')
      product.monthlyfees = getFeeCostsWithFreq(fees, 'ONGOING_FEE', 'MONTHLY')
      product.applicationfees = upfrontFeesObj.applicationFee
      product.applicationoptions = applicationOptions
      product.legalfee = upfrontFeesObj.legalFee
      product.maxlvr = variation.maxLVR || null
      product.minlvr = variation.minLVR || null
      product.introductoryrate = featureExists(features, 'HAS_INTRODUCTORY_RATE') ? variation.introductoryRate : 0
      product.introductoryterm = variation.introductoryTerm ? variation.introductoryTerm : 0
      product.upfrontfee = upfrontFeesObj.upfrontFee
      product.introongoingfees = ongoingFeeObj.introOngoingFee || 0
      product.introongoingfeesfrequency = ongoingFeeObj.introOngoingFeeFreq || null
      product.revertongoingfees = ongoingFeeObj.revertOngoingFee || 0
      product.revertongoingfeefreqency = ongoingFeeObj.revertOngoingFeeFreq ? ongoingFeeObj.revertOngoingFeeFreq : null
      product.fixmonth = variation.fixMonth || null
      product.endfees = getFeeCosts(fees, 'END_FEE').cost ? getFeeCosts(fees, 'END_FEE').cost : 0
      product.extrarepaymentsallowed = repaymentObj.extraRepaymentsAllowed
      product.allowslowdoc = featureExists(features, 'ALLOW_LOW_DOC')
      product.allowssplitloan = featureExists(features, 'ALLOW_SPLIT_LOAN')
      product.hasconstructionfacility = featureExists(features, 'HAS_CONSTRUCTION_FACILITY')
      product.hasfulloffset = offsetAccountObj.hasFullOffset
      product.hasintroductoryrate = featureExists(features, 'HAS_INTRODUCTORY_RATE')
      product.haslineofcredit = featureExists(features, 'HAS_LINE_OF_CREDIT')
      product.hasmortgageportability = featureExists(features, 'HAS_MORTGAGE_PORTABILITY')
      product.hasoffsetaccount = offsetAccountObj.hasOffsetAccount
      product.hasredrawfacility = redrawFacilityObj.hasRedrawFacility
      product.isspecial = isRCSpecial === 'yes'
      product.isfirsthomebuyersavailable = featureExists(features, 'IS_FIRST_HOME_BUYER_AVAILABLE')
      product.requiresfirsthomebuyers = featureExists(features, 'REQUIRES_FIRST_HOME_BUYER')
      product.isgreenhomeloan = featureExists(features, 'IS_GREEN_HOME_LOAN')
      product.bridgingloanmaxlvr = variation.bridgingLoanMaxLVR || null
      product.bridgingloanrate = variation.bridgingLoanRate
      product.hasowneroccupiedpurpose = propertyPurposeTypes.includes('OWNER_OCCUPIED')
      product.hasinvestmentpurpose = propertyPurposeTypes.includes('INVESTMENT')
      product.hasprincipalandinterest = repaymentTypes.includes('PRINCIPAL_AND_INTEREST'),
      product.hasinterestonly = repaymentTypes.includes('INTEREST_ONLY'),
      product.applicationfee = upfrontFeesObj.applicationFee
      product.haslvrwithoutlmi =  conditionExists(conditions, 'LVR_WITHOUT_LMI')
      product.valuationfee = upfrontFeesObj.valuationFee
      product.minloanterm = conditionValue(conditions, 'LOAN_TERM', 'minAmount') / 12
      product.maxloanterm = conditionValue(conditions, 'LOAN_TERM', 'maxAmount') / 12 || 45
      product.lenghtofiorepayment = conditionValue(conditions, 'LENGTH_OF_IO_REPAYMENT', 'maxAmount') /12 || 0
      product.minredrawamount = redrawFacilityObj.minRedrawAmount
      product.maxredrawamount = redrawFacilityObj.maxRedrawAmount
      product.redrawactivationfee = redrawFacilityObj.redrawActivationFee
      product.portabilitytransferfee = getFeeCosts(fees, 'PORTABILITY_TRANSFER_FEE').cost
      product.hastransactionaccount = featureExists(features, 'HAS_TRANSACTION_ACCOUNT')
      product.hascreditcard = featureExists(features, 'HAS_CREDIT_CARD')
      product.hasdebitcard = featureExists(features, 'HAS_DEBIT_CARD')
      product.hasatmwithdrawals = featureExists(features, 'HAS_ATM_WITHDRAWALS')
      product.haseftposwithdrawals = featureExists(features, 'HAS_EFTPOS_WITHDRAWALS')
      product.haschequebook = featureExists(features, 'HAS_CHEQUE_WITHDRAWALS')
      product.hasphonewithdrawals = featureExists(features, 'HAS_PHONE_WITHDRAWALS')
      product.hasinternetwithdrawals = featureExists(features, 'HAS_INTERNET_WITHDRAWALS')
      product.hasrepayholiday = featureExists(features, 'HAS_REPAY_HOLIDAY')
      product.hasloyaltydiscount = featureExists(features, 'HAS_LOYALTY_DISCOUNT')
      product.hastopup = featureExists(features, 'HAS_TOPUP')
      product.optionalratelockfee = getFeeCosts(fees, 'OPTIONAL_RATE_LOCK_FEE').cost || null
      product.mandatoryratelockfee = getFeeCosts(fees, 'MANDATORY_RATE_LOCK_FEE').cost || null
      product.penaltyFeeIfMaxAmountExceeded = repaymentObj.penaltyFeeIfMaxAmountExceeded
      product.isunlimtedredraw = redrawFacilityObj.isUnlimitedRedraw
      product.settlementfee = upfrontFeesObj.settlementFee
      product.switchtofixedfee = getFeeCostsWithFreq(fees, 'SWITCHING_FEE', 'ONE_OFF') || 0.0
      product.missedpaymentpenalty = getFeeCosts(fees, 'MISSED_PAYMENT_PENALTY').cost || 0
      product.adminnotes = adminNotes || null
      product.hasweeklyrepayments = repaymentFrequencies.includes('WEEKLY')
      product.hasfortnightlyrepayments = repaymentFrequencies.includes('FORTNIGHTLY')
      product.hasmonthlyrepayments = repaymentFrequencies.includes('MONTHLY')
      product.ispackage = isPackage || false
      product.isbasicvariable = isBasicVariable || false
      product.isbridgingloan = isBridgingLoan || false
      product.rate = variation.rate
      product.revertrate = getRevertRate(variation, homeLoanType, features) || variation.rate
      product.smsfpurpose = featureExists(features, 'ALLOW_SMSF_BORROWING')
      product.extrarepaymentsvalue = repaymentObj.value
      product.isstandardvariable = featureExists(features, 'IS_STANDARD_VARIABLE') || false //variation.isStandardVariable || false
      product.isnewcustomer = featureExists(features, 'NEW_CUSTOMER_ONLY')
      product.allowsguarantor = featureExists(features, 'ALLOW_GUARANTOR')
      product.dischargefee = getFeeCosts(fees, 'DISCHARGE_FEE').cost || 0.0
      product.familyname = homeLoanFamily ? homeLoanFamily.name : null
      product.isrefinanceonly = featureExists(features, 'IS_REFINANCE_ONLY')
      product.isrefinanceavailable = featureExists(features, 'IS_REFINANCE_AVAILABLE')
      product.otherbenefits = otherBenefits || null
      product.otherrestrictions = otherRestrictions || null
      product.propertytype = variation.propertyType
      product.trusteesmtf = variation.trusteeSMTF
      product.minamountsmsf = variation.minAmountSMSF
      product.nswapplicable = stateApplicable(states, 'NSW')
      product.vicapplicable = stateApplicable(states, 'VIC')
      product.waapplicable = stateApplicable(states, 'WA')
      product.ntapplicable = stateApplicable(states, 'NT')
      product.tasapplicable = stateApplicable(states, 'TAS')
      product.qldapplicable = stateApplicable(states, 'QLD')
      product.saapplicable = stateApplicable(states, 'SA')
      product.actapplicable = stateApplicable(states, 'ACT')
      product.filename = filename
      product.officaladvertisedrate = variation.officalAdvertisedRate ? moment(variation.officalAdvertisedRate).format('YYYY-MM-DD') : null
      product.officalintrorate = variation.officalIntroRate ? moment(variation.officalIntroRate).format('YYYY-MM-DD') : null
      homeLoanProducts.push(product)
    })
  })

  await insertIntoRedshift(homeLoanProducts, filename)
  await homeLoanRatingCalculator.processRedshiftHomeLoans({startDate: collectionDate})
  //await homeLoanRatingCalculator.rollingDelete(collectionDate)
  let dashboard = new leaderDashBoard()
  await dashboard.process({collectionDate})
}

async function insertIntoRedshift (rows, filename) {
  if (rows.length > 0) {
    let table = 'home_loans_history'
    let head = headers(rows[0])
    let csv = json2csv({data: rows, fields: head, hasCSVColumnTitle: false})
    let filepath = `home-loans-history/${process.env.REDSHIFT_DATABASE}/${filename}.csv`
    await awsUploadToS3(filepath, csv, 'redshift-2node')

    let command = `delete from ${table} where filename = $1`
    await redshiftQuery(command, [filename])
    command = `copy ${table} from 's3://redshift-2node/${filepath}' credentials 'aws_access_key_id=${process.env.S3_KEY};aws_secret_access_key=${process.env.S3_SECRET}' EMPTYASNULL CSV ACCEPTINVCHARS TRUNCATECOLUMNS`
    await redshiftQuery(command)
  }
}

function headers (record) {
  return Object.keys(record)
}

const freqPerYear = {
'A': 1,
'S': 2,
'Q': 4,
'M': 12,
'T': 24,
'F': 26.09,
'W': 52.18,
}

function stateApplicable (states, state) {
  return states.includes(state)
}

function featureExists (features, type) {
  return features.some((feature) => feature.featureType === type)
}

function getExtraRepayments (extraRepayments, homeLoanType) {
  let repayment = extraRepayments.find((item) => item.duringPeriod.includes(homeLoanType))
  let value = 0
  let extraRepaymentsAllowed = false
  let repaymentString = 'Not Allowed'
  let penaltyFeeIfMaxAmountExceeded = null

  if (repayment) {
    extraRepaymentsAllowed = repayment['isExtraRepaymentAllow'] === true
    value = repayment['maxAmountOfExtraRepaymentInPercentage'] || repayment['maxAmountOfExtraRepaymentInDollar'] || 0
    penaltyFeeIfMaxAmountExceeded = repayment.penaltyFeeIfMaxAmountExceeded
  }

  if (extraRepaymentsAllowed) {
    repaymentString = value ? 'Allowed with restrictions' : 'Unlimited extra repayments'
  }

  return {
    value,
    extraRepaymentsAllowed,
    repaymentString,
    penaltyFeeIfMaxAmountExceeded,
  }
}

function getRevertRate (variation, loanType, features) {
  if (loanType.toLowerCase().match(/fixed/)) {
    return variation.revertRate
  } else if (featureExists(features, 'HAS_INTRODUCTORY_RATE')) {
    return variation.rate
  } else {
    return 0
  }
}

function conditionExists (conditions, type) {
  return conditions.some((condition) => condition.conditionType === type)
}

function conditionValue (conditions, type, field) {
  const conditionObj = conditions.find((condition) => condition.conditionType === type)
  let value = 0

  if (conditionObj) {
    value = conditionObj[field] || 0
  }

  return value
}

function getOffsetAccountDetails (offsetAccounts, loanType) {
  let offsetAccountObj = offsetAccounts.find((account) => account.duringPeriod && account.duringPeriod.includes(loanType))
  let comment
  let hasFullOffset = false
  let hasOffsetAccount = false

  if (offsetAccountObj) {
    hasOffsetAccount = true
    if (offsetAccountObj.offsetPercentage === 100) {
      hasFullOffset = true
      comment = '100% offset account'
    } else {
      comment = 'Partial offset account'
    }
  } else {
    comment = 'No'
  }

  return {
    comment,
    hasFullOffset,
    hasOffsetAccount,
  }
}

function getRedrawFacilityDetails (redrawFacilities, loanType) {
  let redrawObj = redrawFacilities.find((facility) => facility.duringPeriod.includes(loanType))
  let hasRedrawFacility = false
  let redrawActivationFee = 0
  let redrawFee = 'No redraw option'
  let minRedrawAmount = null
  let maxRedrawAmount = null
  let isUnlimitedRedraw = false

  if (redrawObj) {
    hasRedrawFacility = true

    if (redrawObj.hasOwnProperty('feeToActivateRedraw')) {
      redrawActivationFee = redrawObj.feeToActivateRedraw
    }

    redrawFee = redrawActivationFee

    if (redrawObj.hasOwnProperty('minRedrawAmount')) {
      minRedrawAmount = redrawObj.minRedrawAmount
    }

    if (redrawObj.hasOwnProperty('maxRedrawAmount')) {
      maxRedrawAmount = redrawObj.maxRedrawAmount
    }

    if (redrawObj.hasOwnProperty('isUnlimitedRedraw')) {
      isUnlimitedRedraw = redrawObj.isUnlimitedRedraw
    }
  }

  return {
    hasRedrawFacility,
    redrawActivationFee,
    redrawFee,
    minRedrawAmount,
    maxRedrawAmount,
    isUnlimitedRedraw,
  }
}

function getFeeCosts (fees, feeType, costType = 'fixedCost') {
  let feeObj = fees.find((item) => item.feeType === feeType)
  let cost
  let frequency

  if (feeObj) {
    cost = feeObj[costType]
    frequency = feeObj.frequency
  }

  return {
    cost,
    frequency,
  }
}

function getFeeCostsWithFreq (fees, Type, frequency) {
  let feeObj = fees.find((item) => item.feeType === Type && item.frequency === frequency)

  if (feeObj) {
    return feeObj.fixedCost
  } else {
    return 0
  }
}

function getUpfrontFees (fees) {
  const applicationFee = getFeeCosts(fees, 'APPLICATION_FEE').cost || 0
  const settlementFee = getFeeCosts(fees, 'SETTLEMENT_FEE').cost || 0
  const legalFee = getFeeCosts(fees, 'LEGAL_FEE').cost || 0
  const valuationFee = getFeeCosts(fees, 'VALUATION_FEE').cost || 0
  const upfrontFee = applicationFee + settlementFee + legalFee + valuationFee

  return {
    upfrontFee,
    applicationFee,
    settlementFee,
    legalFee,
    valuationFee,
  }
}

function getOngoingFees (fees, rateType) {
  let introOngoingFee
  let revertOngoingFee
  let introOngoingFeeFreq
  let revertOngoingFeeFreq

  if (rateType.toLowerCase().match(/variable/)) {
    introOngoingFee = 0
    introOngoingFeeFreq = 0
  } else {
    let introObj = getFeeCosts(fees, 'INTRO_ONGOING_FEE')
    introOngoingFee = introObj.cost || 0
    introOngoingFeeFreq = introObj.frequency || 0
  }

  let revertObj = getFeeCosts(fees, 'ONGOING_FEE')
  revertOngoingFee = revertObj.cost || 0
  if (introOngoingFeeFreq) {
    revertOngoingFeeFreq = introOngoingFeeFreq
  } else {
    revertOngoingFeeFreq = revertObj.frequency
  }

  const ongoingFee = introOngoingFee === revertOngoingFee ? parseInt(introOngoingFee) : parseInt(revertOngoingFee)
  let yearlyOngoingFees = 0

  if (introOngoingFeeFreq) {
    yearlyOngoingFees = parseInt(introOngoingFee * freqPerYear[introOngoingFeeFreq.substring(0, 1)])
  }

  return {
    ongoingFee,
    yearlyOngoingFees,
    introOngoingFee,
    introOngoingFeeFreq,
    revertOngoingFee,
    revertOngoingFeeFreq,
  }
}
