require('dotenv').config()

var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
var logger = require('../utils/logger')
const json2csv = require('json2csv')
const moment = require('moment')
const awsUploadToS3 = require('../utils/awsUploadToS3')
const redshiftQuery = require('../utils/ratecityRedshiftQuery')

var SavingsAccount = keystoneShell.list('SavingsAccount')
var SavingsAccountTier = keystoneShell.list('SavingsAccountTier')
const monetizedCollection = require('../routes/api/monetizedCollection')

module.exports = async function () {
  let connection = await mongoosePromise.connect()
  try {
    const savingsAccounts = await SavingsAccount.model.find({$or: [ { isDiscontinued: false }, { isDiscontinued: {$exists: false} } ]}).populate('company').lean().exec()
    const savingsAccountTiers = await SavingsAccountTier.model.find({}).populate('product').lean().exec()

    const date = moment()
    await prepDataAndPushToRedshift(date, savingsAccounts, savingsAccountTiers)

    connection.close()
  } catch (error) {
    logger.error(error)
    connection.close()
    return error
  }
}

async function prepDataAndPushToRedshift (date, savingsAccounts, savingsAccountTiers) {
  const collectionDate = moment(date).format('YYYY-MM-DD')

  const monetized = await monetizedCollection('Savings Accounts')
  const products = []
  const variations = []
  const filename = `savings-accounts-${collectionDate}`
  const filenameTier = `savings-account-tiers-${collectionDate}`

  savingsAccounts.forEach((account) =>{
    let product = {}
    product.collectiondate = collectionDate
    product.savingsaccountid = `${account._id}`
    product.uuid = account.uuid
    product.name = account.name
    product.slug = account.slug
    product.companyname = account.company.name
    product.othernames = account.otherNames.toString()
    product.displayname = account.displayName ? account.displayName : null
    product.gotositeurl = monetized[account._id] ? monetized[account._id].applyUrl : null
    product.gotositeenabled = monetized[account._id] ? monetized[account._id].enabled : false
    product.paymenttype =  monetized[account._id] ? monetized[account._id].paymentType : null
    product.promotedorder = account.promotedOrder
    product.isspecial = account.isSpecial
    product.isrcspecial = account.isRCSpecial
    product.offerExpires = account.offerExpires
    product.ecpc = account.ecpc
    product.otherbenefits = account.otherBenefits
    product.otherrestrictions = account.otherRestrictions
    product.minimumagerestrictions = account.minimumAgeRestrictions ? account.minimumAgeRestrictions : 0
    product.maximumagerestrictions = account.maximumAgeRestrictions ? account.maximumAgeRestrictions : null
    product.minimumopeningdeposit = account.minimumOpeningDeposit
    product.linkedaccountrequired = account.linkedAccountRequired
    product.isonlineonly = account.isOnlineOnly
    product.hasatmaccess = account.hasAtmAccess
    product.haseftposfacility = account.hasEftposFacility ? account.hasEftposFacility : 'UNKNOWN'
    product.hasinternetfacility = account.hasInternetFacility
    product.hasphonefacility = account.hasPhoneFacility
    product.hasbranchaccess = account.hasBranchAccess
    product.accountkeepingfees = account.accountKeepingFees ? account.accountKeepingFees : null
    product.accountkeepingfeesfrequency = account.accountKeepingFeesFrequency ? account.accountKeepingFeesFrequency : null
    product.internettransactionfee = account.internetTransactionFee
    product.phonetransactionfee = account.phoneTransactionFee
    product.eftposfee = account.eftposFee ? account.eftposFee  : null
    product.overseaseftposFee = account.overseasEftposFee ? account.overseasEftposFee  : null
    product.overthecounterdepositfee = account.overTheCounterDepositFee ? account.overTheCounterDepositFee : 0
    product.overthecounterwithdrawalfee = account.overTheCounterWithdrawalFee ? account.overTheCounterWithdrawalFee : 0
    product.atmwithdrawalfee = account.atmWithdrawalFee ? account.atmWithdrawalFee : 0
    product.jointApplicationavailable = account.jointApplicationAvailable
    product.unlimitedwithdrawals = account.unlimitedWithdrawals
    product.isdiscontinued = account.isDiscontinued ? account.isDiscontinued : false
    product.filename = filename
    products.push(product)

    let tiers = savingsAccountTiers.filter((item) => item.product.uuid === account.uuid)

    tiers.forEach((variation) => {
      let tier = {}
      tier.collectiondate = collectionDate
      tier.tierid = variation._id
      tier.productuuid = account.uuid
      tier.name = variation.name
      tier.repvaraition = variation.repVariation
      tier.minimumamount = variation.minimumAmount
      tier.maximumamount = variation.maximumAmount
      tier.maximumrate = variation.maximumRate
      tier.baserate = variation.baseRate
      tier.bonusrate = variation.bonusRate
      tier.bonusratecondition = variation.bonusRateCondition
      tier.introductoryrate = variation.introductoryRate
      tier.introductoryrateterm = variation.introductoryRateTerm
      tier.minimummonthlydeposit = variation.minimumMonthlyDeposit
      tier.isdiscontinued = account.isDiscontinued ? account.isDiscontinued : false
      tier.filename = filenameTier
      variations.push(tier)
    })
  })

  const headers = [ 'collectiondate', 'savingsaccountid', 'uuid', 'name', 'slug', 'companyname',
    'othernames', 'displayname', 'gotositeurl', 'gotositeenabled', 'paymenttype',
    'promotedorder', 'isspecial', 'isrcspecial', 'offerExpires', 'ecpc',
    'otherbenefits', 'otherrestrictions', 'minimumagerestrictions',
    'maximumagerestrictions', 'minimumopeningdeposit', 'linkedaccountrequired',
    'isonlineonly', 'hasatmaccess', 'haseftposfacility', 'hasinternetfacility',
    'hasphonefacility', 'hasbranchaccess', 'accountkeepingfees',
    'accountkeepingfeesfrequency', 'internettransactionfee',
    'phonetransactionfee', 'eftposfee', 'overseaseftposFee',
    'overthecounterdepositfee', 'overthecounterwithdrawalfee', 'atmwithdrawalfee',
    'jointApplicationavailable', 'unlimitedwithdrawals', 'isdiscontinued',
    'filename',
  ]

  const tierHeaders = ['collectiondate', 'tierid', 'productuuid', 'name',
    'repvaraition', 'minimumamount', 'maximumamount', 'maximumrate', 'baserate',
    'bonusrate', 'bonusratecondition', 'introductoryrate', 'introductoryrateterm',
    'minimummonthlydeposit', 'isdiscontinued', 'filename',
  ]

  await insertIntoRedshift(products, headers, filename, 'savings_accounts_history')
  await insertIntoRedshift(variations, tierHeaders, filenameTier, 'savings_accounts_tiers_history')
}

async function insertIntoRedshift (rows, headers, filename, table) {
  if (rows.length > 0) {
    let csv = json2csv({data: rows, fields: headers, hasCSVColumnTitle: false})
    await awsUploadToS3(`savings-accounts-history/${process.env.REDSHIFT_DATABASE}/${filename}`, csv, 'redshift-2node')

    let command = `delete from ${table} where filename = $1`
    await redshiftQuery(command, [filename])
    command = `copy ${table} from 's3://redshift-2node/savings-accounts-history/${process.env.REDSHIFT_DATABASE}/${filename}' credentials 'aws_access_key_id=${process.env.S3_KEY};aws_secret_access_key=${process.env.S3_SECRET}' EMPTYASNULL CSV ACCEPTINVCHARS TRUNCATECOLUMNS`
    await redshiftQuery(command)
  }
}
