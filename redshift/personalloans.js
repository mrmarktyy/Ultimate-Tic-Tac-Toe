require('dotenv').config()

var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
var logger = require('../utils/logger')
const json2csv = require('json2csv')
const moment = require('moment')
const awsUploadToS3 = require('../utils/awsUploadToS3')
const redshiftQuery = require('../utils/redshiftQuery')

var PersonalLoan = keystoneShell.list('PersonalLoan')
var PersonalLoanVariation = keystoneShell.list('PersonalLoanVariation')
var PersonalLoanQualification = keystoneShell.list('PersonalLoanQualification')

module.exports = async function () {
  let connection = await mongoosePromise.connect()
  try {
    const personalLoans = await PersonalLoan.model.find({}).populate('company').lean().exec()
    const personalLoanVariations = await PersonalLoanVariation.model.find({}).populate('product').lean().exec()
    const qualifications = await PersonalLoanQualification.model.find().populate('knockouts').lean().exec()
    const date = moment()
    await prepDataAndPushToRedshift(date, personalLoans, personalLoanVariations, qualifications)

    connection.close()
  } catch (error) {
    logger.error(error)
    connection.close()
    return error
  }
}

async function prepDataAndPushToRedshift (date, personalLoans, personalLoanVariations, qualifications) {
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
    instantApproval: 'UNKNOWN',
    timeToFunding: 0,
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
    allPurposesAllowed: 'UNKNOWN',
    otherPurposes: '',
    encumbranceCheckFees: 0.0,
    redrawActivationFee: 0.0,
    minRedrawAmount: 0.0,
    hasEarlyExitPenalty: 'UNKNOWN',
    missedPaymentPenalty: 0.0,
    earlyExitPenaltyFee: 0.0,
    earlyExitPenaltyFeePeriod: 0,
    extraRepaymentDollarLimits: 0,
    extraRepaymentDollarLimitsPeriod: 0,
    hasEarlyExitPenaltyFeesVaries: 'UNKNOWN',
    otherFees: 0.0,
    personalisedFeeMinimum: 0,
    personalisedFeeMaximum: 0,
    personalisedFeeName: '',
    hasQualification: false,
    qualificationName: '',
    employmentStatus: '',
    minEmploymentLengthFullTime: 0,
    minEmploymentLengthPartTime: 0,
    minEmploymentLengthContractors: 0,
    minEmploymentLengthSelfEmployed: 0,
    minEmploymentLengthSoleTrader: 0,
    minEmploymentLengthCasual: 0,
    isOnProbationAccepted: true,
    minExperianScore: 0,
    minDunBradstreetScore: 0,
    isGovernmentIncomeAccepted: true,
    isMoreThan50GovernmentIncomeAccepted: false,
    residency: '',
    knockouts: '',
    isDiscontinued: false,
    filename: filename,
  }

  personalLoans.forEach((loan) => {
    let product = Object.assign({}, defaultPersonalLoan)
    product.collectionDate = collectionDate
    product.productId = loan._id
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
    product.instantApproval = loan.instantApproval
    product.timeToFunding = loan.timeToFunding
    product.applicationFeesDollar = loan.applicationFeesDollar
    product.ongoingFees = loan.ongoingFees
    product.ongoingFeesFrequency = loan.ongoingFeesFrequency
    product.docReleaseFees = loan.docReleaseFees
    product.isSelfEmploymentAccepted = loan.isSelfEmploymentAccepted
    product.isNewCarAllowed = loan.isNewCarAllowed
    product.isUsedCarAllowed = loan.isUsedCarAllowed
    product.isMotorcycleAllowed = loan.isMotorcycleAllowed
    product.isBoatAllowed = loan.isBoatAllowed
    product.isStudentAllowed = loan.isStudentLoanAllowed
    product.isDebtConsolidationAllowed = loan.isDebtConsolidationAllowed
    product.isRenovationAllowed = loan.isRenovationAllowed
    product.isSharesAllowed = loan.isSharesAllowed
    product.isHolidaysAllowed = loan.isHolidaysAllowed
    product.isMedicalBillAllowed = loan.isMedicalBillAllowed
    product.isWeddingAllowed = loan.isWeddingAllowed
    product.allPurposesAllowed = loan.allPurposesAllowed
    product.otherPurposes = loan.otherPurposes
    product.repaymentFreq = loan.repaymentFrequency
    product.extraRepaymentDollarLimits = loan.extraRepaymentDollarLimits
    product.extraRepaymentDollarLimitsPeriod = loan.extraRepaymentDollarLimitsPeriod
    product.hasEarlyExitPenalty = loan.hasEarlyExitPenalty === 'UNKNOWN' ? null : loan.hasEarlyExitPenalty
    product.earlyExitPenaltyFee = loan.earlyExitPenaltyFee
    product.missedPaymentPenalty = loan.missedPaymentPenalty
    product.personalisedFeeMinimum = loan.personalisedFeeMinimum
    product.personalisedFeeMaximum = loan.personalisedFeeMaximum
    product.personalisedFeeName = loan.personalisedFeeName
    let qualification = qualifications.find((qual) => {
      return qual.product && loan._id.toString() === qual.product.toString()
    })
    product.hasQualification = !!qualification
    if (qualification) {
      product.qualificationName = qualification.name
      product.employmentStatus = qualification.employmentStatus
      product.minEmploymentLengthFullTime = qualification.minEmploymentLengthFullTime
      product.minEmploymentLengthPartTime = qualification.minEmploymentLengthPartTime
      product.minEmploymentLengthContractors = qualification.minEmploymentLengthContractors
      product.minEmploymentLengthSelfEmployed = qualification.minEmploymentLengthSelfEmployed
      product.minEmploymentLengthSoleTrader = qualification.minEmploymentLengthSoleTrader
      product.minEmploymentLengthCasual = qualification.minEmploymentLengthCasual
      product.isOnProbationAccepted = qualification.isOnProbationAccepted
      product.minExperianScore = qualification.minExperianScore
      product.minDunBradstreetScore = qualification.minDunBradstreetScore
      product.isGovernmentIncomeAccepted = qualification.isGovernmentIncomeAccepted
      product.isMoreThan50GovernmentIncomeAccepted = qualification.isMoreThan50GovernmentIncomeAccepted
      product.residency = qualification.residency
      product.knockouts = qualification.knockouts ? qualification.knockouts.map((knockout) => knockout.name) : ''
    }
    product.isDiscontinued = loan.isDiscontinued

    personalLoanProducts.push(product)

    let variations = personalLoanVariations.filter((item) => item.product.uuid === loan.uuid)

    variations.forEach((cVariation) => {
      let variation = {}
      variation.collectionDate = collectionDate
      variation.id = cVariation._id.toString()
      variation.productId = product.productId
      variation.uuid = product.uuid
      variation.description = product.description
      variation.minLoanAmount = cVariation.minLoanAmount
      variation.maxLoanAmount = cVariation.maxLoanAmount
      variation.minLoanTerm = cVariation.minLoanTerm
      variation.maxLoanTerm = cVariation.maxLoanTerm
      variation.minRate = cVariation.minRate
      variation.maxRate = cVariation.maxRate
      variation.introRate = cVariation.introRate
      variation.introTerm = cVariation.introTerm
      variation.comparisonRatePersonal = cVariation.comparisonRatePersonal
      variation.comparisonRateCar = cVariation.comparisonRateCar
      variation.applicationFeesPercent = cVariation.applicationFeesPercent
      variation.applicationFeesDollar = cVariation.applicationFeesDollar
      variation.hasHomeOwnersDiscount = cVariation.hasHomeOwnersDiscount
      variation.isMarketplaceParticipant = cVariation.isMarketplaceParticipant
      variation.minEquifaxScore = cVariation.minEquifaxScore
      variation.maxEquifaxScore = cVariation.maxEquifaxScore
      variation.minimumIncome = cVariation.minimumIncome
      variation.maximumIncome = cVariation.maximumIncome
      variation.minimumAge = cVariation.minimumAge
      variation.maximumAge = cVariation.maximumAge
      variation.chanceOfApproval = cVariation.chanceOfApproval
      variation.equifaxScoreType = cVariation.equifaxScoreType
      variation.thinFile = cVariation.thinFile
      variation.riskAssuranceFee = cVariation.riskAssuranceFee
      variation.generateRange = cVariation.generateRange
      variation.rangeMinFee = cVariation.rangeMinFee
      variation.filename = filenameVar

      personalLoanProductVariations.push(variation)
    })
  })

  const headers = [
    'collectionDate', 'productId', 'uuid', 'description', 'companyCode', 'companyName', 'companyId', 'isCarLoan',
    'isPersonalLoan', 'isLineOfCredit', 'isFullyDrawnAdvance', 'repaymentType', 'repaymentFreq', 'isExtraRepaymentsAllowed',
    'hasRedrawFacility', 'securedType', 'instantApproval', 'timeToFunding',
    'applicationFeesDollar', 'applicationFeesPercent', 'ongoingFees',
    'ongoingFeesFrequency', 'docReleaseFees', 'isSecuredByVehicle', 'isSecuredByProperty', 'isSecuredByDeposit',
    'securedByOthers', 'isSpecial', 'isRCSpecial', 'specialConditions', 'isRestrictedToCurrentHLCustomer', 'minimumYearsAddress',
    'minimumIncome', 'isFullTimeEmploymentAccepted', 'isPartTimeEmploymentAccepted', 'isContractEmploymentAccepted',
    'isSelfEmploymentAccepted', 'otherBenefits', 'otherRestrictions', 'adminNotes', 'isNewCarAllowed', 'isUsedCarAllowed',
    'isMotorcycleAllowed', 'isBoatAllowed', 'isStudentAllowed', 'isDebtConsolidationAllowed', 'isRenovationAllowed',
    'isSharesAllowed', 'isHolidaysAllowed', 'isMedicalBillAllowed',
    'isWeddingAllowed', 'allPurposesAllowed', 'otherPurposes', 'encumbranceCheckFees',
    'redrawActivationFee', 'minRedrawAmount', 'hasEarlyExitPenalty', 'missedPaymentPenalty',
    'earlyExitPenaltyFee', 'earlyExitPenaltyFeePeriod', 'extraRepaymentDollarLimits',
    'extraRepaymentDollarLimitsPeriod',
    'hasEarlyExitPenaltyFeesVaries', 'otherFees', 'personalisedFeeMinimum',
    'personalisedFeeMaximum', 'personalisedFeeName', 'hasQualification', 'qualificationName',
    'employmentStatus', 'minEmploymentLengthFullTime',
    'minEmploymentLengthPartTime', 'minEmploymentLengthContractors',
    'minEmploymentLengthSelfEmployed', 'minEmploymentLengthSoleTrader', 'minEmploymentLengthCasual',
    'isOnProbationAccepted', 'minExperianScore',
    'minDunBradstreetScore', 'isGovernmentIncomeAccepted',
    'isMoreThan50GovernmentIncomeAccepted', 'residency', 'knockouts',
    'isDiscontinued', 'filename',
  ]

  const variationHeaders = [
    'collectionDate',
    'id',
    'productId',
    'uuid',
    'description',
    'minLoanAmount',
    'maxLoanAmount',
    'minLoanTerm',
    'maxLoanTerm',
    'minRate',
    'maxRate',
    'introRate',
    'introTerm',
    'comparisonRatePersonal',
    'comparisonRateCar',
    'applicationFeesPercent',
    'applicationFeesDollar',
    'hasHomeOwnersDiscount',
    'isMarketplaceParticipant',
    'minEquifaxScore',
    'maxEquifaxScore',
    'minimumIncome',
    'maximumIncome',
    'minimumAge',
    'maximumAge',
    'chanceOfApproval',
    'equifaxScoreType',
    'thinFile',
    'riskAssuranceFee',
    'generateRange',
    'rangeMinFee',
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
