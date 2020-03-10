require('dotenv').config()

var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
var logger = require('../utils/logger')
const json2csv = require('json2csv')
const moment = require('moment')
const awsUploadToS3 = require('../utils/awsUploadToS3')
const redshiftQuery = require('../utils/ratecityRedshiftQuery')

// const bankAccountRatingCalculator = require('../services/realTimeRating/bankAccountRatingCalculator')
// const leaderBoardBankAccounts = require('../services/realTimeRating/leaderBoardBankAccounts')

var BankAccount = keystoneShell.list('BankAccount')
const monetizedCollection = require('../routes/api/monetizedCollection')

const BANKACCOUNT_HEADER = [
  'collectiondate', 'uuid', 'name', 'slug', 'companyname', 'companyuuid', 'othernames',
  'displayname', 'gotositeenabled', 'gotositeurl', 'paymenttype', 'promotedorder',
  'legacycode', 'minimumopeningamount',
  'minimumdepositrequiredforfeefree', 'minimumdepositrequiredforfeefreefrequency',
  'minimumagerestrictions', 'maximumagerestrictions', 'linkedaccountrequired',
  'jointapplicationavailable', 'haschequeservices', 'hasatmaccess',
  'haseftposfacility', 'hasinternetbanking', 'hasphonebanking', 'hasapp',
  'hasbranchaccess', 'hasoverdraftfacility', 'accountkeepingfee',
  'accountkeepingfeesfrequency', 'internettransactionfee', 'phonetransactionfee',
  'eftposfee', 'chequedepositfee', 'chequedishonourfee', 'overseaseftposfee',
  'overseasatmwithdrawalfee', 'foreigntransactionfeedollars', 'foreigntransactionfeepercent',
  'counterdepositfee', 'counterwithdrawalfee', 'freecountertransactioncount',
  'atmwithdrawalfee', 'hasotherbankatmwithdrawalfee', 'otherbankatmwithdrawalfeewaivercondition',
  'dailyatmwithdrawallimit', 'networkbankatmfeewaiver', 'interestcalculationfrequency',
  'interestpaymentfrequency', 'minimumbalancetoactivateinterestrate',
  'minimuminterestrate', 'maximuminterestrate', 'interestratedescription',
  'smartpaysupport', 'debitcardtypes', 'uniquefeatures', 'additionalbenefits',
  'restrictions', 'isdiscontinued', 'filename',
]

module.exports = async function () {
  let connection = await mongoosePromise.connect()
  try {
    const bankAccounts = await BankAccount.model.find({$or: [ { isDiscontinued: false }, { isDiscontinued: {$exists: false} } ]}).populate('company').lean().exec()
    const date = moment()
    await prepDataAndPushToRedshift(date, bankAccounts)

    connection.close()
  } catch (error) {
    logger.error(error)
    connection.close()
    return error
  }
}

async function prepDataAndPushToRedshift (date, bankAccounts) {
  const collectionDate = moment(date).format('YYYY-MM-DD')

  const monetized = await monetizedCollection('Bank Accounts')
  const products = []
  const filename = `bank-accounts-${collectionDate}`

  bankAccounts.forEach((account) => {
    let product = {}
    product.collectiondate = collectionDate
    product.uuid = account.uuid
    product.name = account.name
    product.slug = account.slug
    product.companyname = account.company.name
    product.companyuuid = account.company.uuid
    product.othernames = account.otherNames.toString()
    product.displayname = account.displayName ? account.displayName : null
    product.gotositeenabled = monetized[account._id] ? monetized[account._id].enabled : false
    product.gotositeurl = monetized[account._id] ? monetized[account._id].applyUrl : null
    product.paymenttype =  monetized[account._id] ? monetized[account._id].paymentType : null
    product.promotedorder = account.promotedOrder
    product.legacycode = account.legacyCode
    product.minimumopeningamount = account.minimumOpeningAmount
    product.minimumdepositrequiredforfeefree = account.minimumDepositRequiredForFeeFree
    product.minimumdepositrequiredforfeefreefrequency = account.minimumDepositRequiredForFeeFreeFrequency
    product.minimumagerestrictions = account.minimumAgeRestrictions
    product.maximumagerestrictions = account.maximumAgeRestrictions
    product.linkedaccountrequired = account.linkedAccountRequired
    product.jointapplicationavailable = account.jointApplicationAvailable
    product.haschequeservices = account.hasChequeServices
    product.hasatmaccess = account.hasAtmAccess
    product.haseftposfacility = account.hasEftposFacility
    product.hasinternetbanking = account.hasInternetBanking
    product.hasphonebanking = account.hasPhoneBanking
    product.hasapp = account.hasApp
    product.hasbranchaccess = account.hasBranchAccess
    product.hasoverdraftfacility = account.hasOverdraftFacility
    product.accountkeepingfee = account.accountKeepingFee
    product.accountkeepingfeesfrequency = account.accountKeepingFeesFrequency
    product.internettransactionfee = account.internetTransactionFee
    product.phonetransactionfee = account.phoneTransactionFee
    product.eftposfee = account.eftposFee
    product.chequedepositfee = account.chequeDepositFee
    product.chequedishonourfee = account.chequeDishonourFee
    product.overseaseftposfee = account.overseasEftposFee
    product.overseasatmwithdrawalfee = account.overseasATMWithdrawalFee
    product.foreigntransactionfeedollars = account.foreignTransactionFeeDollars
    product.foreigntransactionfeepercent = account.foreignTransactionFeePercent
    product.counterdepositfee = account.counterDepositFee
    product.counterwithdrawalfee = account.counterWithdrawalFee
    product.freecountertransactioncount = account.freeCounterTransactionCount
    product.atmwithdrawalfee = account.atmWithdrawalFee
    product.hasotherbankatmwithdrawalfee = account.hasOtherBankATMWithdrawalFee
    product.otherbankatmwithdrawalfeewaivercondition = account.otherBankATMWithdrawalFeeWaiverCondition
    product.dailyatmwithdrawallimit = account.dailyATMwithdrawalLimit
    product.networkbankatmfeewaiver = account.networkBankATMFeeWaiver
    product.interestcalculationfrequency = account.interestCalculationFrequency
    product.interestpaymentfrequency = account.interestPaymentFrequency
    product.minimumbalancetoactivateinterestrate = account.minimumBalanceToActivateInterestRate
    product.minimuminterestrate = account.minimumInterestRate
    product.maximuminterestrate = account.maximumInterestRate
    product.interestratedescription = account.interestRateDescription
    product.smartpaysupport = account.smartPaySupport
    product.debitcardtypes = account.debitCardTypes
    product.uniquefeatures = account.uniqueFeatures
    product.additionalbenefits = account.additionalBenefits
    product.restrictions = account.restrictions
    product.isdiscontinued = account.isDiscontinued ? account.isDiscontinued : false
    product.filename = filename
    products.push(product)
  })

  await insertIntoRedshift(products, BANKACCOUNT_HEADER, filename, 'bank_accounts_history')

  // await bankAccountRatingCalculator({startDate: collectionDate})
  // let dashboard = new leaderBoardBankAccounts()
  // await dashboard.process({collectionDate: collectionDate})
}

async function insertIntoRedshift (rows, headers, filename, table) {
  if (rows.length > 0) {
    let csv = json2csv({data: rows, fields: headers, hasCSVColumnTitle: false})
    await awsUploadToS3(`bank-accounts-history/${process.env.REDSHIFT_DATABASE}/${filename}`, csv, 'redshift-2node')

    let command = `delete from ${table} where filename = $1`
    await redshiftQuery(command, [filename])
    command = `copy ${table} from 's3://redshift-2node/bank-accounts-history/${process.env.REDSHIFT_DATABASE}/${filename}' credentials 'aws_access_key_id=${process.env.S3_KEY};aws_secret_access_key=${process.env.S3_SECRET}' EMPTYASNULL CSV ACCEPTINVCHARS TRUNCATECOLUMNS`
    await redshiftQuery(command)
  }
}
