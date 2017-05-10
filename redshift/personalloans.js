require('dotenv').config()

const json2csv = require('json2csv')
const moment = require('moment')
const awsUploadToS3 = require('../utils/awsUploadToS3')
const redshiftQuery = require('../utils/redshiftQuery')

const mongoose = require('mongoose')
const keystone = require('keystone')

keystone.init({
  'auto update': true,
  'session': true,
  'auth': true,
  'user model': 'User',
  'session store': 'mongo',
  'mongo': process.env.MONGO_URI,
})

keystone.import('../models')

module.exports = function () {
  mongoose.connect(process.env.MONGO_URI)

  mongoose.connection.on('open', async () => {
    const PersonalLoan = keystone.list('PersonalLoan')
    const PersonalLoanVariation = keystone.list('PersonalLoanVariation')

    const personalLoans = await PersonalLoan.model.find({}).populate('company personalloan').lean().exec()
    const personalLoanVariations = await PersonalLoanVariation.model.find({}).populate('product').lean().exec()

    const date = moment()
    await prepDataAndPushToRedshift(date, personalLoans, personalLoanVariations)

    mongoose.connection.close()
  })
}

async function prepDataAndPushToRedshift (date, personalLoans, personalLoanVariations) {
  const collectionDate = moment(date).format('YYYY-MM-DD')

  const personalLoanProducts = []
  const personalLoanProductVariations = []
  const filename = `personal-loans-${collectionDate}`
  const filenameVar = `personal-loan-variations-${collectionDate}`

  const defaultPersonalLoan = {
    productId: '',
    uuid: '',
    description: '',
    companyCode: '',
    company: '',
    companyId: '',
    isCarLoan: 'UNKNOWN',
    isPersonalLoan: 'UNKNOWN',
    isLineOfCredit: 'UNKNOWN',
    isFullyDrawnAdvance: 'UNKNOWN',
    repaymentType: '',
    repaymentFreq: '',
    isExtraRepaymentsAllowed: 'UNKNOWN',
    hasRedrawFacility: 'UNKNOWN',
    securedType: 'UNKNOWN',
    applicationFeesDollar: 0.0,
    applicationFeesPercent: 0.0,
    ongoingFees: 0.0,
    ongoingFeesFrequency: '',
    docReleaseFees: 0.0,
    isSecuredByVehicle: 'UNKNOWN',
    isSecuredByProperty: 'UNKNOWN',
    isSecuredByDeposit: 'UNKNOWN',
    securedByOthers: '',
    isSpecial: 'NO',
    isRCSpecial: 'NO',
    specialConditions: '',
    isRestrictedToCurrentHLCustomer: 'UNKNOWN',
    minimumYearsAddress: 0,
    minimumIncome: 0.0,
    isFullTimeEmploymentAccepted: 'UNKNOWN',
    isPartTimeEmploymentAccepted: 'UNKNOWN',
    isContractEmploymentAccepted: 'UNKNOWN',
    isSelfEmploymentAccepted: 'UNKNOWN',
    otherBenefits: '',
    otherRestrictions: '',
    adminNotes: '',
    isNewCarAllowed: 'UNKNOWN',
    isUsedCarAllowed: 'UNKNOWN',
    isMotorcycleAllowed: 'UNKNOWN',
    isBoatAllowed: 'UNKNOWN',
    isStudentAllowed: 'UNKNOWN',
    isDebtConsolidationAllowed: 'UNKNOWN',
    isRenovationAllowed: 'UNKNOWN',
    isSharesAllowed: 'UNKNOWN',
    isHolidaysAllowed: 'UNKNOWN',
    isMedicalBillAllowed: 'UNKNOWN',
    isWeddingAllowed: 'UNKNOWN',
    otherPurposes: '',
    encumbranceCheckFees: 0.0,
    redrawActivationFee: 0.0,
    minRedrawAmount: 0.0,
    hasEarlyExitPenalty: 'UNKNOWN',
    missedPaymentPenalty: 0.0,
    earlyExitPenaltyFee: 0.0,
    earlyExitPenaltyFeePeriod: 0,
    hasEarlyExitPenaltyFeesVaries: 'UNKNOWN',
    otherFees: 0.0,
    isDiscontinued: false,
    filename: filename,
  }

  personalLoans.forEach((loan) => {
    let product = Object.assign({}, defaultPersonalLoan)
    product.collectionDate = collectionDate
    product.productId = loan.legacyCode !== '' ? loan.legacyCode : `${loan._id}`
    product.uuid = loan.uuid
    product.description = loan.name
    product.companyCode = loan.company.legacyCode
    product.companyName = loan.company.name
    product.companyId = loan.company.uuid
    product.isCarLoan = loan.isCarLoan
    product.isPersonalLoan = loan.isPersonalLoan
    product.isLineOfCredit = loan.isLineOfCredit
    product.isFullyDrawnAdvance = loan.isFullyDrawnAdvance
    product.repaymentType = loan.repaymentType
    product.isExtraRepaymentsAllowed = loan.isExtraRepaymentsAllowed
    product.hasRedrawFacility = loan.hasRedrawFacility
    product.securedType = loan.securedType
    product.applicationFeesDollar = loan.applicationFeesDollar
    product.ongoingFees = loan.ongoingFees
    product.ongoingFeesFrequency = loan.ongoingFeesFrequency
    product.docReleaseFees = loan.docReleaseFees
    product.isSelfEmploymentAccepted = loan.isSelfEmploymentAccepted
    product.isNewCarAllowed = loan.isNewCarAllowed
    product.isUsedCarAllowed = loan.isUsedCarAllowed
    product.isMotorcycleAllowed = loan.isMotorcycleAllowed
    product.isBoatAllowed = loan.isBoatAllowed
    product.isStudentAllowed = loan.isStudentAllowed
    product.isDebtConsolidationAllowed = loan.isDebtConsolidationAllowed
    product.isRenovationAllowed = loan.isRenovationAllowed
    product.isSharesAllowed = loan.isSharesAllowed
    product.isHolidaysAllowed = loan.isHolidaysAllowed
    product.otherPurposes = loan.otherPurposes
    product.repaymentFreq = loan.repaymentFrequency
    product.hasEarlyExitPenalty = loan.hasEarlyExitPenalty === 'UNKNOWN' ? null : loan.hasEarlyExitPenalty
    product.earlyExitPenaltyFee = loan.earlyExitPenaltyFee
    product.missedPaymentPenalty = loan.missedPaymentPenalty
    product.isDiscontinued = loan.isDiscontinued

    personalLoanProducts.push(product)

    let variations = personalLoanVariations.filter((item) => item.product.uuid === loan.uuid)
    let variation = {}
    variations.forEach((cVariation) => {
      variation.collectionDate = collectionDate
      variation.productId = product.productId
      variation.uuid = product.uuid
      variation.description = product.description
      variation.minLoanAmount = cVariation.minLoanAmount
      variation.maxLoanAmount = cVariation.maxLoanAmount
      variation.minLoanTerm = cVariation.minLoanTerm
      variation.maxLoanTerm = cVariation.maxLoanTerm
      variation.minRate = cVariation.minRate
      variation.maxRate = cVariation.maxRate
      variation.comparisonRatePersonal = cVariation.comparisonRatePersonal
      variation.comparisonRateCar = cVariation.comparisonRateCar
      variation.applicationFeesPercent = cVariation.applicationFeesPercent
      variation.applicationFeesDollar = cVariation.applicationFeesDollar
      variation.filename = filenameVar
      personalLoanProductVariations.push(variation)
    })
  })

  const headers = [
    'collectionDate', 'productId', 'uuid', 'description', 'companyCode', 'companyName', 'companyId', 'isCarLoan',
    'isPersonalLoan', 'isLineOfCredit', 'isFullyDrawnAdvance', 'repaymentType', 'repaymentFreq', 'isExtraRepaymentsAllowed',
    'hasRedrawFacility', 'securedType', 'applicationFeesDollar', 'applicationFeesPercent', 'ongoingFees',
    'ongoingFeesFrequency', 'docReleaseFees', 'isSecuredByVehicle', 'isSecuredByProperty', 'isSecuredByDeposit',
    'securedByOthers', 'isSpecial', 'isRCSpecial', 'specialConditions', 'isRestrictedToCurrentHLCustomer', 'minimumYearsAddress',
    'minimumIncome', 'isFullTimeEmploymentAccepted', 'isPartTimeEmploymentAccepted', 'isContractEmploymentAccepted',
    'isSelfEmploymentAccepted', 'otherBenefits', 'otherRestrictions', 'adminNotes', 'isNewCarAllowed', 'isUsedCarAllowed',
    'isMotorcycleAllowed', 'isBoatAllowed', 'isStudentAllowed', 'isDebtConsolidationAllowed', 'isRenovationAllowed',
    'isSharesAllowed', 'isHolidaysAllowed', 'isMedicalBillAllowed', 'isWeddingAllowed', 'otherPurposes', 'encumbranceCheckFees',
    'redrawActivationFee', 'minRedrawAmount', 'hasEarlyExitPenalty', 'missedPaymentPenalty', 'earlyExitPenaltyFee',
    'earlyExitPenaltyFeePeriod', 'hasEarlyExitPenaltyFeesVaries', 'otherFees', 'isDiscontinued', 'filename',
  ]

  const variationHeaders = [
    'collectionDate',
    'productId',
    'uuid',
    'description',
    'minLoanAmount',
    'maxLoanAmount',
    'minLoanTerm',
    'maxLoanTerm',
    'minRate',
    'maxRate',
    'comparisonRatePersonal',
    'comparisonRateCar',
    'applicationFeesPercent',
    'applicationFeesDollar',
    'filename',
  ]

  await insertIntoRedshift(personalLoanProducts, headers, filename, 'personal_loans_history')
  await insertIntoRedshift(personalLoanProductVariations, variationHeaders, filenameVar, 'personal_loans_variations_history')
}

async function insertIntoRedshift (rows, headers, filename, table) {
  if (rows.length > 0) {
    let csv = json2csv({data: rows, fields: headers, hasCSVColumnTitle: false})
    await awsUploadToS3(`personal-loans-history/${process.env.REDSHIFT_DATABASE}/${filename}`, csv, 'ratecity-redshift')

    let command = `delete from ${table} where filename = $1`
    await redshiftQuery(command, [filename])
    command = `copy ${table} from 's3://ratecity-redshift/personal-loans-history/${process.env.REDSHIFT_DATABASE}/${filename}' credentials 'aws_access_key_id=${process.env.S3_KEY};aws_secret_access_key=${process.env.S3_SECRET}' EMPTYASNULL CSV ACCEPTINVCHARS TRUNCATECOLUMNS`
    await redshiftQuery(command)
  }
}
