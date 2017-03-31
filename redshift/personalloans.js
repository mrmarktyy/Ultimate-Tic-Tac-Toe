require('dotenv').config()

const logger = require('../utils/logger')
const Pool = require('pg').Pool
const json2csv = require('json2csv')
const moment = require('moment')
const FlakeIdGen = require('flake-idgen')
const intformat = require('biguint-format')
const AWS = require('aws-sdk')
AWS.config.update({region: process.env.S3_REGION, accessKeyId: process.env.S3_KEY, secretAccessKey: process.env.S3_SECRET})

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

  const defaultPersonalLoan = {
    productId: '',
    uuid: '',
    description: '',
    companyCode: '',
    company: '',
    companyId: '',
    isCarLoan: '',
    isPersonalLoan: '',
    isLineOfCredit: '',
    isFullyDrawnAdvance: '',
    repaymentType: '',
    repaymentFreq: '',
    isExtraRepaymentsAllowed: '',
    hasRedrawFacility: '',
    securedType: '',
    applicationFeesDollar: 0.0,
    applicationFeesPercent: 0.0,
    ongoingFees: 0.0,
    ongoingFeesFrequency: '',
    docReleaseFees: 0.0,
    isSecuredByVehicle: '',
    isSecuredByProperty: '',
    isSecuredByDeposit: '',
    securedByOthers: '',
    isSpecial: false,
    isRCSpecial: false,
    specialConditions: '',
    isRestrictedToCurrentHLCustomer: '',
    minimumYearsAddress: 0,
    minimumIncome: 0.0,
    isFullTimeEmploymentAccepted: false,
    isPartTimeEmploymentAccepted: false,
    isContractEmploymentAccepted: false,
    isSelfEmploymentAccepted: '',
    otherBenefits: '',
    otherRestrictions: '',
    adminNotes: '',
    isNewCarAllowed: '',
    isUsedCarAllowed: '',
    isMotorcycleAllowed: '',
    isBoatAllowed: '',
    isStudentAllowed: '',
    isDebtConsolidationAllowed: '',
    isRenovationAllowed: '',
    isSharesAllowed: '',
    isHolidaysAllowed: '',
    isMedicalBillAllowed: '',
    isWeddingAllowed: '',
    otherPurposes: '',
    encumbranceCheckFees: 0.0,
    redrawActivationFee: 0.0,
    minRedrawAmount: 0.0,
    hasEarlyExitPenalty: false,
    missedPaymentPenalty: 0.0,
    earlyExitPenaltyFee: 0.0,
    earlyExitPenaltyFeePeriod: 0,
    hasEarlyExitPenaltyFeesVaries: '',
    otherFees: 0.0,
    isDiscontinued: '',
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

      personalLoanProductVariations.push(variation)
    })
  })

  const generator = new FlakeIdGen
  const id = generator.next()
  const _id = intformat(id, 'dec')

  const filename = `personal-loans-${collectionDate}-${_id}`
  const filenameVar = `personal-loan-variations-${collectionDate}-${_id}`

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
    'earlyExitPenaltyFeePeriod', 'hasEarlyExitPenaltyFeesVaries', 'otherFees', 'isDiscontinued',
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
  ]

  await insertIntoRedshift(personalLoanProducts, headers, filename, 'personal_loans_history')
  await insertIntoRedshift(personalLoanProductVariations, variationHeaders, filenameVar, 'personal_loans_variations_history')
}

function uploadToS3 (filename, content) {
  const s3 = new AWS.S3()

  return new Promise((resolve, reject) => {
    let params = {
      Bucket: 'ratecity-redshift',
      Key: filename,
      ACL: 'bucket-owner-full-control',
      Body: content,
    }
    s3.putObject(params, (error, data) => {
      if (error) {
        logger.error(error.stack)
        reject(error)
      }
      if (data) {
        resolve()
        logger.info(data)
      }
    })
  })
}

async function insertIntoRedshift (rows, headers, filename, table) {
  const config = {
    user: process.env.REDSHIFT_USERNAME,
    database: process.env.REDSHIFT_DATABASE,
    password: process.env.REDSHIFT_PASSWORD,
    host: process.env.REDSHIFT_HOST,
    port: process.env.REDSHIFT_PORT,
  }
  const pool = new Pool(config)

  if (rows.length > 0) {
    let csv = json2csv({data: rows, fields: headers, hasCSVColumnTitle: false})
    await uploadToS3(`personal-loans-history/${filename}`, csv)

    const command = `copy ${table} from 's3://ratecity-redshift/personal-loans-history/${filename}' credentials 'aws_access_key_id=${process.env.S3_KEY};aws_secret_access_key=${process.env.S3_SECRET}' EMPTYASNULL CSV ACCEPTINVCHARS TRUNCATECOLUMNS`
    await new Promise((resolve, reject) => {
      pool.query(command, [], (error, result) => {
        if (error) {
          logger.error(error)
          reject(error)
        } else {
          logger.info('inserted into redshift')
          resolve()
        }
      })
    })
  }
}