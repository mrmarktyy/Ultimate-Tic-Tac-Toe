require('dotenv').config()

var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
var logger = require('../utils/logger')
const json2csv = require('json2csv')
const moment = require('moment')
const awsUploadToS3 = require('../utils/awsUploadToS3')
const redshiftQuery = require('../utils/redshiftQuery')

const monetizedCollection = require('../routes/api/monetizedCollection')
var CreditCard = keystoneShell.list('CreditCard')
var EarnRate = keystoneShell.list('EarnRate')
var Perk = keystoneShell.list('Perk')
var PartnerConversion = keystoneShell.list('PartnerConversion')
var Redemption = keystoneShell.list('Redemption')

const CREDIT_CARD_HEADER = [
  'collectionDate', 'name', 'uuid', 'slug', 'otherNames', 'displayName',
  'companyName', 'gotoSiteEnabled', 'gotoSiteUrl', 'paymentType', 'isDiscontinued',
  'legacyCode', 'cardType', 'cardLevel', 'isLowRate', 'isLowFee', 'isReward',
  'isStoreCard', 'isStudentCard', 'isJointApplicationAllowed',
  'isGamblingTransactionsAllowed', 'minimumBalanceTransferAmount',
  'maximumBalanceTransferPercentage', 'balanceTransferConditions',
  'maximumBalanceTransferAmount', 'isBalanceTransferFromPersonalLoanAllowed',
  'ecpc', 'interestFreeDays', 'minimumRepaymentDollars', 'minimumRepaymentPercent',
  'minimumCreditLimit', 'maximumCreditLimit', 'numberFreeSupplementary',
  'applePayAvailable', 'googlePayAvailable', 'samsungPayAvailable',
  'contactlessAvailable', 'otherBenefits', 'otherRestrictions', 'adminNotes',
  'annualFeeIntro', 'annualFeeIntroTerm', 'annualFeeStandard',
  'annualFeeSpendWaiver', 'annualFeeSpendWaiverTerm', 'annualFeeOtherWaiver',
  'balanceTransferFeeDollars', 'balanceTransferFeePercent', 'cashAdvanceMinFee',
  'cashAdvanceMaxFee', 'cashAdvancePercent', 'foreignExchangeFeeVisaDollar',
  'foreignExchangeFeeVisaPercent', 'foreignExchangeFeeVisaAtm', 'visaOverseasReplaceCardFee',
  'foreignExchangeFeeMcDollar', 'foreignExchangeFeeMcPercent', 'foreignExchangeFeeMcATM',
  'mcOverseasReplaceCardFee', 'foreignExchangeFeeAmexDollar', 'foreignExchangeFeeAmexPercent',
  'foreignExchangeFeeAmexATM', 'amexOverseasReplaceCardFee', 'foreignExchangeFeeAmexAudatInternational',
  'latePaymentFee', 'overLimitFee', 'duplicateStatementFee', 'supplementaryCardAnnualFee',
  'minimumAge', 'minimumIncome', 'minimumCreditRating', 'availableTo457Visa',
  'eligibilityConditions', 'instantApproval', 'perksAdditional', 'purchaseRateStandard',
  'purchaseRateIntro', 'purchaseRateIntroTerm', 'balanceTransferStandard',
  'balanceTransferIntro', 'balanceTransferIntroTerm', 'cashAdvanceRateStandard',
  'cashAdvanceRateIntro', 'cashAdvanceRateIntroTerm', 'defaultRewardProgram',
  'rewardProgram', 'rewardProgramId', 'pointsCap', 'pointsCapFrequency',
  'bonusPoints', 'bonusPointsConditions', 'cardArtUrl', 'monthlyClicks', 'filename',
]

const PERK_HEADER = [
  'collectionDate', 'id', 'perkType', 'creditcardUuid', 'value', 'conditions',
  'days', 'daysConditions', 'assumptions', 'filename',
]

const EARNRATE_HEADER = [
  'collectiondate', 'id', 'creditcarduuid', 'isgenericearnrate', 'pointsearned',
  'spendat', 'cardtype', 'rangeminimum', 'rangemaximum', 'rangeunit', 'rangeperiod',
  'filename',
]

const REDEMPTION_HEADER = [
  'collectionDate', 'rewardProgramId', 'rewardProgram',
  'partnerProgramId', 'partnerProgram', 'redemptionType', 'redemptionName',
  'conversionRate', 'pointsRequired', 'rewardAdjustedPoints', 'price',
  'dollarPerPoint', 'priceMethod', 'filename',
]

module.exports = async function () {
  let connection = await mongoosePromise.connect()
  try {
    const creditCards = await CreditCard.model.find({isDiscontinued: false}).populate('company rewardProgram').lean().exec()
    const date = moment()
    await prepDataAndPushToRedshift(date, creditCards)

    connection.close()
    return 0
  } catch (error) {
    logger.error(error)
    connection.close()
    return error
  }
}

async function prepDataAndPushToRedshift (date, creditCards) {
  const collectionDate = moment(date).format('YYYY-MM-DD')
  const monetized = await monetizedCollection('Credit Cards')
  let earnRates = await EarnRate.model.find().populate('product').lean().exec()
  let perks = await Perk.model.find().populate('product perkType').lean().exec()

  let products = []
  let creditcardEarnRates = []
  let creditcardPerks = []

  const filename = `credit-cards-${collectionDate}`
  const perkFilename = `credit-cards-perks-${collectionDate}`
  const earnFilename = `credit-cards-earnrates-${collectionDate}`
  const redemptionFilename = `credit-cards-redemptions-${collectionDate}`

  creditCards.forEach((card) => {
    let product = {}
    product.collectionDate = collectionDate
    product.name = card.name
    product.uuid = card.uuid
    product.slug = card.slug
    product.otherNames = card.otherNames
    product.displayName = card.displayName
    product.companyName = card.company ? card.company.name : null
    product.gotoSiteEnabled = monetized[card._id] ? monetized[card._id].enabled : false
    product.gotoSiteUrl = monetized[card._id] ? monetized[card._id].applyUrl : null
    product.paymentType =  monetized[card._id] ? monetized[card._id].paymentType : null
    product.isDiscontinued = false
    product.legacyCode = card.legacyCode
    product.cardType = card.cardType
    product.cardLevel = card.cardLevel
    product.isLowRate = card.isLowRate
    product.isLowFee = card.isLowFee
    product.isReward = card.isReward
    product.isStoreCard = card.isStoreCard
    product.isStudentCard = card.isStudentCard
    product.isJointApplicationAllowed = card.isJointApplicationAllowed
    product.isGamblingTransactionsAllowed = card.isGamblingTransactionsAllowed
    product.minimumBalanceTransferAmount = card.minimumBalanceTransferAmount
    product.maximumBalanceTransferPercentage = card.maximumBalanceTransferPercentage
    product.balanceTransferConditions = card.balanceTransferConditions
    product.maximumBalanceTransferAmount = card.maximumBalanceTransferAmount
    product.isBalanceTransferFromPersonalLoanAllowed = card.isBalanceTransferFromPersonalLoanAllowed
    product.ecpc = card.ecpc
    product.interestFreeDays = card.interestFreeDays
    product.minimumRepaymentDollars = card.minimumRepaymentDollars
    product.minimumRepaymentPercent = card.minimumRepaymentPercent
    product.minimumCreditLimit = card.minimumCreditLimit
    product.maximumCreditLimit = card.maximumCreditLimit
    product.numberFreeSupplementary = card.numberFreeSupplementary
    product.applePayAvailable = card.applePayAvailable
    product.googlePayAvailable = card.googlePayAvailable
    product.samsungPayAvailable = card.samsungPayAvailable
    product.contactlessAvailable = card.contactlessAvailable
    product.otherBenefits = card.otherBenefits
    product.otherRestrictions = card.otherRestrictions
    product.adminNotes = card.adminNotes
    product.annualFeeIntro = card.annualFeeIntro
    product.annualFeeIntroTerm = card.annualFeeIntroTerm
    product.annualFeeStandard = card.annualFeeStandard
    product.annualFeeSpendWaiver = card.annualFeeSpendWaiver
    product.annualFeeSpendWaiverTerm = card.annualFeeSpendWaiverTerm
    product.annualFeeOtherWaiver = card.annualFeeOtherWaiver
    product.balanceTransferFeeDollars = card.balanceTransferFeeDollars
    product.balanceTransferFeePercent = card.balanceTransferFeePercent
    product.cashAdvanceMinFee = card.cashAdvanceMinFee
    product.cashAdvanceMaxFee = card.cashAdvanceMaxFee
    product.cashAdvancePercent = card.cashAdvancePercent
    product.foreignExchangeFeeVisaDollar = card.foreignExchangeFeeVisaDollar
    product.foreignExchangeFeeVisaPercent = card.foreignExchangeFeeVisaPercent
    product.foreignExchangeFeeVisaAtm = card.foreignExchangeFeeVisaAtm
    product.visaOverseasReplaceCardFee = card.visaOverseasReplaceCardFee
    product.foreignExchangeFeeMcDollar = card.foreignExchangeFeeMcDollar
    product.foreignExchangeFeeMcPercent = card.foreignExchangeFeeMcPercent
    product.foreignExchangeFeeMcATM = card.foreignExchangeFeeMcATM
    product.mcOverseasReplaceCardFee = card.mcOverseasReplaceCardFee
    product.foreignExchangeFeeAmexDollar = card.foreignExchangeFeeAmexDollar
    product.foreignExchangeFeeAmexPercent = card.foreignExchangeFeeAmexPercent
    product.foreignExchangeFeeAmexATM = card.foreignExchangeFeeAmexATM
    product.amexOverseasReplaceCardFee = card.amexOverseasReplaceCardFee
    product.foreignExchangeFeeAmexAudatInternational = card.foreignExchangeFeeAmexAudatInternational
    product.latePaymentFee = card.latePaymentFee
    product.overLimitFee = card.overLimitFee
    product.duplicateStatementFee = card.duplicateStatementFee
    product.supplementaryCardAnnualFee = card.supplementaryCardAnnualFee
    product.minimumAge = card.minimumAge
    product.minimumIncome = card.minimumIncome
    product.minimumCreditRating = card.minimumCreditRating
    product.availableTo457Visa = card.availableTo457Visa
    product.eligibilityConditions = card.eligibilityConditions
    product.instantApproval = card.instantApproval
    product.perksAdditional = card.perksAdditional
    product.purchaseRateStandard = card.purchaseRateStandard
    product.purchaseRateIntro = card.purchaseRateIntro
    product.purchaseRateIntroTerm = card.purchaseRateIntroTerm
    product.balanceTransferStandard = card.balanceTransferStandard
    product.balanceTransferIntro = card.balanceTransferIntro
    product.balanceTransferIntroTerm = card.balanceTransferIntroTerm
    product.cashAdvanceRateStandard = card.cashAdvanceRateStandard
    product.cashAdvanceRateIntro = card.cashAdvanceRateIntro
    product.cashAdvanceRateIntroTerm = card.cashAdvanceRateIntroTerm
    product.defaultRewardProgram = card.defaultRewardProgram
    product.rewardProgram = card.rewardProgram ? card.rewardProgram.name : null
    product.rewardProgramId = card.rewardProgram ? card.rewardProgram._id : null
    product.pointsCap = card.pointsCap
    product.pointsCapFrequency = card.pointsCapFrequency
    product.bonusPoints = card.bonusPoints
    product.bonusPointsConditions = card.bonusPointsConditions
    product.cardArtUrl = card.cardArt ? card.cardArt.url : null
    product.monthlyClicks = card.monthlyClicks
    product.filename = filename
    products.push(product)

    let cardPerks = perks.filter((perk) => { return  card._id.toString() === perk.product._id.toString() })
    cardPerks.forEach((perk) => {
      let cardPerk = {}
      cardPerk.collectionDate = collectionDate
      cardPerk.id = perk._id.toString()
      cardPerk.perkType = perk.perkType.name
      cardPerk.creditcardUuid = perk.product.uuid
      cardPerk.value = perk.value
      cardPerk.conditions = perk.conditions
      cardPerk.days = perk.days
      cardPerk.daysConditions = perk.daysConditions
      cardPerk.assumptions  = perk.perkType.Assumptions
      cardPerk.filename = perkFilename

      creditcardPerks.push(cardPerk)
    })

    let rates = earnRates.filter((rate) => { return  card._id.toString() === rate.product._id.toString() })
    rates.forEach((earn) =>{
      let earnRate = {}
      earnRate.collectiondate = collectionDate
      earnRate.id = earn._id.toString()
      earnRate.creditcarduuid= earn.product.uuid
      earnRate.isgenericearnrate = earn.isGenericEarnRate
      earnRate.pointsearned = earn.pointsEarned
      earnRate.spendat = earn.spendAt
      earnRate.cardtype = earn.cardType
      earnRate.rangeminimum = earn.rangeMinimum
      earnRate.rangemaximum = earn.rangeMaximum
      earnRate.rangeunit = earn.rangeUnit
      earnRate.rangeperiod = earn.rangePeriod
      earnRate.filename = earnFilename

      creditcardEarnRates.push(earnRate)
    })
  })

  let programRedemptions = await addPartnerConversion(creditCards, collectionDate, redemptionFilename)

  await insertIntoRedshift(products, CREDIT_CARD_HEADER, filename, 'credit_cards_history')
  await insertIntoRedshift(creditcardPerks, PERK_HEADER, perkFilename, 'credit_cards_perks_history')
  await insertIntoRedshift(creditcardEarnRates, EARNRATE_HEADER, earnFilename, 'credit_cards_earnrates_history')
  await insertIntoRedshift(programRedemptions, REDEMPTION_HEADER, redemptionFilename, 'credit_cards_redemptions_history')
  return 0
}

async function addPartnerConversion (creditCards, collectionDate, filename) {
  let programs = []
  creditCards.forEach((card) => {
    if (card.rewardProgram) {
      programs.push(card.rewardProgram)
    }
  })
  programs = [...new Set(programs)]

  let partnerConversions = await getPartnerConversions()
  let redemptions = await Redemption.model.find().populate('program redemptionName redemptionType').lean().exec()
  let filteredRedemptions = []

  let programRedemptions = []
  programs.forEach((program) => {
    let rewardDefault = {}
    rewardDefault.collectionDate = collectionDate
    rewardDefault.rewardProgramId = program._id.toString()
    rewardDefault.rewardProgram = program.name
    rewardDefault.partnerProgramId = null
    rewardDefault.partnerProgram = null
    rewardDefault.redemptionType = null
    rewardDefault.redemptionName = null
    rewardDefault.conversionRate = 1
    rewardDefault.pointsRequired = 0
    rewardDefault.rewardAdjustedPoints = 0
    rewardDefault.price = 0
    rewardDefault.dollarPerPoint = 0
    rewardDefault.priceMethod = null
    rewardDefault.filename = filename

    filteredRedemptions = getRedeption(rewardDefault, redemptions)
    if (filteredRedemptions.length >= 1) {
      programRedemptions.push(filteredRedemptions)
    }

    if (partnerConversions[program._id]) {
      partnerConversions[program._id.toString()].forEach((conversion) => {
        let partnerDefault = {}
        partnerDefault.partnerProgramId = conversion.partnerProgram._id.toString()
        partnerDefault.partnerProgram = conversion.partnerProgram.name
        partnerDefault.conversionRate = conversion.conversionRate

        filteredRedemptions = getRedeption(Object.assign({}, rewardDefault, partnerDefault), redemptions)
        if (filteredRedemptions.length >= 1) {
          programRedemptions.push(filteredRedemptions)
        }
      })
    }
  })
  return [].concat(...programRedemptions)
}

async function getPartnerConversions () {
  let partnerConversions = await PartnerConversion.model.find().populate('rewardProgram partnerProgram').lean().exec()
  let obj = {}
  partnerConversions.forEach((conversion) => {
    if (!obj[conversion.rewardProgram._id]) {
      obj[conversion.rewardProgram._id.toString()] = []
    }
    obj[conversion.rewardProgram._id.toString()].push(conversion)
  })
  return obj
}

function getRedeption (redemptionProgram, redemptions) {
  let programId
  if (redemptionProgram.partnerProgramId === null) {
    programId = redemptionProgram.rewardProgramId
  } else {
    programId = redemptionProgram.partnerProgramId
  }
  let filtedRedemptions = redemptions.filter((redemption) => { return redemption.program._id.toString() === programId})
  let results = []
  filtedRedemptions.forEach((redemption) => {
    let redemptionExtract = {
      redemptionName: redemption.redemptionName.name,
      redemptionType: redemption.redemptionType.name,
      pointsRequired: redemption.pointsRequired,
      rewardAdjustedPoints: redemption.pointsRequired / redemptionProgram.conversionRate,
      price: redemption.redemptionName.price,
      dollarPerPoint: Number(redemption.redemptionName.price / (redemption.pointsRequired / redemptionProgram.conversionRate).toFixed(4)),
      priceMethod: redemption.redemptionName.priceMethod,
    }
    results.push(Object.assign({}, redemptionProgram, redemptionExtract))
  })
  return results
}

async function insertIntoRedshift (rows, headers, filename, table) {
  if (rows.length > 0) {
    let csv = json2csv({data: rows, fields: headers, hasCSVColumnTitle: false})
    await awsUploadToS3(`credit-cards-history/${process.env.REDSHIFT_DATABASE}/${filename}`, csv, 'ratecity-redshift')

    let command = `delete from ${table} where filename = $1`
    await redshiftQuery(command, [filename])
    command = `copy ${table} from 's3://ratecity-redshift/credit-cards-history/${process.env.REDSHIFT_DATABASE}/${filename}' credentials 'aws_access_key_id=${process.env.S3_KEY};aws_secret_access_key=${process.env.S3_SECRET}' EMPTYASNULL CSV ACCEPTINVCHARS TRUNCATECOLUMNS`
    await redshiftQuery(command)
  }
}

