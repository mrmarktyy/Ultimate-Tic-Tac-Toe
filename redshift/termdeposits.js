require('dotenv').config()

var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
var logger = require('../utils/logger')
const json2csv = require('json2csv')
const moment = require('moment')
const awsUploadToS3 = require('../utils/awsUploadToS3')
const redshiftQuery = require('../utils/ratecityRedshiftQuery')

var TermDeposit = keystoneShell.list('TermDeposit')
var TermDepositTier = keystoneShell.list('TermDepositTier')
const monetizedCollection = require('../routes/api/monetizedCollection')

const TERM_DEPOSIT_HEADER= [
  'collectionDate', 'uuid', 'name', 'slug', 'otherNames', 'displayName',
  'promotedOrder', 'gotositeenabled', 'gotositeurl', 'paymenttype', 'legacyID',
  'companyUuid', 'companyName', 'accountKeepingFee', 'earlyWithdrawalPenalty',
  'otherBenefits', 'otherRestrictions', 'earlyWithdrawalFee', 'minimumAgeRequirement',
  'coveredByGovernmentGuaranteeRestriction', 'noticePeriodToWithdraw',
  'jointApplicationAvailable', 'maturityAlertByEmail', 'maturityAlertByPhone',
  'automaticMaturityRollover', 'interestPaymentViaOtherInstitution',
  'earlyWithdrawalAvailable', 'isCoveredByGovernmentGuarantee',
  'interestPaymentFrequencyOptions', 'interestPaymentMethod',
  'accountKeepingFeeFrequency', 'monthlyClicks', 'isDiscontinued', 'filename'
]

const TIER_HEADER = [
  'collectionDate', 'id', 'termDepositUuid', 'name', 'minimumDeposit',
  'maximumDeposit', 'interestRate', 'term', 'interestPaymentFrequencyTerm',
  'interestCalculationFrequency', 'filename'
]

module.exports = async function () {
  let connection = await mongoosePromise.connect()
  try {
    const termDeposits = await TermDeposit.model.find({$or: [ { isDiscontinued: false }, { isDiscontinued: {$exists: false} } ]}).populate('company').lean().exec()
    const termDepositTiers = await TermDepositTier.model.find().populate('product').lean().exec()

    const date = moment()
    await prepDataAndPushToRedshift(date, termDeposits, termDepositTiers)

    connection.close()
  } catch (error) {
    logger.error(error)
    connection.close()
    return error
  }
}

async function prepDataAndPushToRedshift (date, termDeposits, termDepositTiers) {
  const collectionDate = moment(date).format('YYYY-MM-DD')

  const monetized = await monetizedCollection('Term Deposits')
  const products = []
  const variations = []
  const filename = `term-deposits-${collectionDate}`
  const tierFilename = `term-deposits-tiers-${collectionDate}`

  termDeposits.forEach((account) => {
    let product = {}
    product.collectionDate = collectionDate
    product.uuid = account.uuid
    product.name = account.name
    product.slug = account.slug
    product.otherNames = account.otherNames
    product.displayName = account.displayName || null
    product.promotedOrder = account.promotedOrder
    product.gotositeenabled = monetized[account._id] ? monetized[account._id].enabled : false
    product.gotositeurl = monetized[account._id] ? monetized[account._id].applyUrl : null
    product.paymenttype =  monetized[account._id] ? monetized[account._id].paymentType : null
    product.legacyID = account.legacyID
    product.companyUuid = account.company.uuid
    product.companyName = account.company.name
    product.accountKeepingFee = account.accountKeepingFee
    product.earlyWithdrawalPenalty = account.earlyWithdrawalPenalty
    product.otherBenefits = account.otherBenefits
    product.otherRestrictions = account.otherRestrictions
    product.earlyWithdrawalFee = account.earlyWithdrawalFee || null
    product.minimumAgeRequirement = account.minimumAgeRequirement || null
    product.coveredByGovernmentGuaranteeRestriction = account.coveredByGovernmentGuaranteeRestriction || null
    product.noticePeriodToWithdraw = account.noticePeriodToWithdraw
    product.jointApplicationAvailable = account.jointApplicationAvailable
    product.maturityAlertByEmail = account.maturityAlertByEmail
    product.maturityAlertByPhone = account.maturityAlertByPhone
    product.automaticMaturityRollover = account.automaticMaturityRollover
    product.interestPaymentViaOtherInstitution = account.interestPaymentViaOtherInstitution
    product.earlyWithdrawalAvailable = account.earlyWithdrawalAvailable
    product.isCoveredByGovernmentGuarantee = account.isCoveredByGovernmentGuarantee|| null
    product.interestPaymentFrequencyOptions = account.interestPaymentFrequencyOptions || null
    product.interestPaymentMethod = account.interestPaymentMethod
    product.accountKeepingFeeFrequency = account.accountKeepingFeeFrequency
    product.monthlyClicks = account.monthlyClicks || 0
    product.isDiscontinued = account.isDiscontinued
    product.filename = filename

    products.push(product)

    let tiers = termDepositTiers.filter((item) => item.product.uuid === account.uuid)

    tiers.forEach((tier) => {
      let variation = {}
      variation.collectionDate = collectionDate
      variation.id = tier._id.toString()
      variation.termDepositUuid = tier.product.uuid
      variation.name = tier.name
      variation.minimumDeposit = tier.minimumDeposit
      variation.maximumDeposit = tier.maximumDeposit
      variation.interestRate = tier.interestRate
      variation.term = tier.term
      variation.interestPaymentFrequencyTerm = tier.interestPaymentFrequencyTerm
      variation.interestCalculationFrequency = tier.interestCalculationFrequency || null
      variation.filename = tierFilename

      variations.push(variation)
    })

  })

  await insertIntoRedshift(products, TERM_DEPOSIT_HEADER, filename, 'term_deposits_history')
  await insertIntoRedshift(variations, TIER_HEADER, tierFilename, 'term_deposits_tiers_history')
}

async function insertIntoRedshift (rows, headers, filename, table) {
  if (rows.length > 0) {
    let csv = json2csv({data: rows, fields: headers, hasCSVColumnTitle: false})
    await awsUploadToS3(`term-deposits-history/${process.env.REDSHIFT_DATABASE}/${filename}`, csv, 'redshift-2node')

    let command = `delete from ${table} where filename = $1`
    await redshiftQuery(command, [filename])
    command = `copy ${table} from 's3://redshift-2node/term-deposits-history/${process.env.REDSHIFT_DATABASE}/${filename}' credentials 'aws_access_key_id=${process.env.S3_KEY};aws_secret_access_key=${process.env.S3_SECRET}' EMPTYASNULL CSV ACCEPTINVCHARS TRUNCATECOLUMNS`
    await redshiftQuery(command)
  }
}
