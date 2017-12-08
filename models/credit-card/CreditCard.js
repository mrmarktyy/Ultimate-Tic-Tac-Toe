var keystone = require('keystone')
var uuid = require('node-uuid')
var availableOptions = require('../attributes/availableOptions')
var productCommonAttributes = require('../common/ProductCommonAttributes')
var { imageStorage } = require('../helpers/fileStorage')
var changeLogService = require('../../services/changeLogService')
var verifiedService = require('../../services/verifiedService')
var verifiedCommonAttribute = require('../common/verifiedCommonAttribute')

var Types = keystone.Field.Types

var CreditCard = new keystone.List('CreditCard', {
    track: true,
})

CreditCard.add(productCommonAttributes)

CreditCard.add({
	company: {
		type: Types.Relationship,
		ref: 'Company',
		required: true,
		initial: true,
		index: true,
		noedit: true,
	},
	legacyCode: { type: Types.Text },
	cardType: {
		type: Types.Select,
		options: ['Visa', 'MasterCard', 'AMEX', 'Diners Club', 'Visa & AMEX', 'MasterCard & AMEX'],
		required: true,
		initial: true,
	},
	cardLevel: {
		type: Types.Select,
		options: ['Standard', 'Gold', 'Platinum', 'Premium'],
		default: 'Standard',
		emptyOption: false,
		required: true,
	},
	isLowRate: { type: Types.Boolean, indent: true, noedit: true },
	isLowFee: { type: Types.Boolean, indent: true, noedit: true },
	isReward: { type: Types.Boolean, indent: true, noedit: true },
	isStoreCard: { type: Types.Boolean, indent: true, default: false },
	isStudentCard: { type: Types.Boolean, indent: true, default: false },
	isJointApplicationAllowed: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
	isGamblingTransactionsAllowed: { type: Types.Select, options: ['Prohibited', 'Allowed but treated as Cash Advance', 'Allowed', 'UNKNOWN'], default: 'UNKNOWN' },
	minimumBalanceTransferAmount: { type: Types.Number },
	maximumBalanceTransferPercentage: { type: Types.Number, label: 'Max Balance Transfer %' },
	isBalanceTransferFromPersonalLoanAllowed: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
	ecpc: { type: Types.Number, noedit: true, default: 0 },
	interestFreeDays: { type: Types.Number, min: 0 },
	minimumRepaymentDollars: { type: Types.Number, min: 0, label: 'Min Rpymnt Dllrs' },
	minimumRepaymentPercent: { type: Types.Number, min: 0, label: 'Min Rpymnt Prcnt' },
	minimumCreditLimit: { type: Types.Number, min: 0 },
	maximumCreditLimit: { type: Types.Number, min: 0 },
	numberFreeSupplementary: { type: Types.Number, min: 0, label: 'Nmbr Free Sppl' },
	applePayAvailable: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
	androidPayAvailable: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
	samsungPayAvailable: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
	contactlessAvailable: { type: Types.Select, required: true, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
	otherBenefits: { type: Types.Text },
	otherRestrictions: { type: Types.Text },
	adminNotes: { type: Types.Text },
	annualFeeIntro: { type: Types.Number, min: 0 },
	annualFeeIntroTerm: { type: Types.Number, min: 0 },
	annualFeeStandard: { type: Types.Number, min: 0, default: 0 },
	annualFeeSpendWaiver: { type: Types.Number, min: 0 },
	annualFeeSpendWaiverTerm: { type: Types.Number, min: 0, label: 'Annul Fee Spnd Wvr Trm' },
	annualFeeOtherWaiver: { type: Types.Text },
	balanceTransferFeeDollars: { type: Types.Number, min: 0, label: 'Blnc Trnsf Fee Dllrs' },
	balanceTransferFeePercent: { type: Types.Number, min: 0, label: 'Blnc Trnsf Fee Prcnt' },
	cashAdvanceMinFee: { type: Types.Number, min: 0 },
	cashAdvanceMaxFee: { type: Types.Number, min: 0 },
	cashAdvancePercent: { type: Types.Number, min: 0 },
	foreignExchangeFeeVisaDollar: { type: Types.Number, min: 0, label: 'FX Fee Visa Dllrs' },
	foreignExchangeFeeVisaPercent: { type: Types.Number, min: 0, label: 'FX Fee Visa Prcnt' },
	foreignExchangeFeeVisaAtm: { type: Types.Number, min: 0, label: 'FX Fee Visa ATM' },
	visaOverseasReplaceCardFee: { type: Types.Number, min: 0, label: 'Visa OS Rplc Crd Fee' },
	foreignExchangeFeeMcDollar: { type: Types.Number, min: 0, label: 'FX Fee Mc Dllrs' },
	foreignExchangeFeeMcPercent: { type: Types.Number, min: 0, label: 'FX Fee Mc Prcnt' },
	foreignExchangeFeeMcATM: { type: Types.Number, min: 0, label: 'FX Fee Mc ATM' },
	mcOverseasReplaceCardFee: { type: Types.Number, min: 0, label: 'Mc OS Rplc Crd Fee' },
	foreignExchangeFeeAmexDollar: { type: Types.Number, min: 0, label: 'FX Fee Amex Dllrs' },
	foreignExchangeFeeAmexPercent: { type: Types.Number, min: 0, label: 'FX Fee Amex Prcnt' },
	foreignExchangeFeeAmexATM: { type: Types.Number, min: 0, label: 'FX Fee Amex ATM' },
	amexOverseasReplaceCardFee: { type: Types.Number, min: 0, label: 'Amex OS Rplc Crd Fee' },
	foreignExchangeFeeAmexAudatInternational: { type: Types.Number, min: 0, label: 'FX Fee Amex Aud Intrn' },
	latePaymentFee: { type: Types.Number, min: 0 },
	overLimitFee: { type: Types.Number, min: 0 },
	duplicateStatementFee: { type: Types.Number, min: 0 },
	supplementaryCardAnnualFee: { type: Types.Number, min: 0, label: 'Sppl Crd Annl Fee' },
	minimumAge: { type: Types.Number, min: 0 },
	minimumIncome: { type: Types.Number, min: 0 },
	minimumCreditRating: { type: Types.Text },
	availableTo457Visa: { type: Types.Select, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
	eligibilityConditions: { type: Types.Text },
	instantApproval: { type: Types.Select, options: availableOptions.all, emptyOption: false, default: availableOptions.unknown },
	perksFreeDomesticTravelInsurance: {
		type: Types.Select,
		options: availableOptions.all,
		label: 'Prk Free Dmstc Trvl Ins',
		emptyOption: false,
		default: availableOptions.unknown,
	},
	perksFreeDomesticTravelInsuranceConditions: { type: Types.Text, label: 'Prk Free Dmstc Trvl Ins Cnd' },
	perksFreeInternationalTravelInsurance: {
		type: Types.Select,
		options: availableOptions.all,
		label: 'Prk Free Intn Trvl Ins',
		emptyOption: false,
		default: availableOptions.unknown,
	},
	perksFreeInternationalTravelInsuranceConditions: { type: Types.Text, label: 'Prk Free Intn Trvl Ins Cnd' },
	perksFreeTravelInsuranceDays: { type: Types.Number, min: 0, label: 'Prk Free Trvl Insrnc Dys' },
	perksFreeTravelInsuranceDaysConditions: { type: Types.Text, label: 'Prk Free Trvl Insrnc Dys Cnd' },
	perksFreeSupplementaryCards: {
		type: Types.Select,
		options: availableOptions.all,
		label: 'Prk Free Sppl Crd',
		emptyOption: false,
		default: availableOptions.unknown,
	},
	perksFreeSupplementaryCardsConditions: { type: Types.Text, label: 'Prk Free Sppl Crd Cdtns' },
	perksPurchaseProtection: {
		type: Types.Select,
		options: availableOptions.all,
		emptyOption: false,
		default: availableOptions.unknown,
	},
	perksPurchaseProtectionDays: { type: Types.Number, label: 'Prk Prchs Prtctn Dys' },
	perksPurchaseProtectionConditions: { type: Types.Text, label: 'Prk Prchs Prtctn Cndtns' },
	perksPriceGuarantee: { type: Types.Select, emptyOption: false, options: availableOptions.all, default: availableOptions.unknown },
	perksPriceGuaranteeConditions: { type: Types.Text, label: 'Prk Prc Grnt Cndtns' },
	perksExtendedWarranty: {
		type: Types.Select,
		options: availableOptions.all,
		emptyOption: false,
		default: availableOptions.unknown,
	},
	perksExtendedWarrantyConditions: { type: Types.Text, label: 'Prk Extndd Wrrnty Cndtns' },
	perksRentalCarExcessInsurance: {
		type: Types.Select,
		options: availableOptions.all,
		label: 'Prk Excss Insrnc',
		emptyOption: false,
		default: availableOptions.unknown,
	},
	perksRentalCarExcessInsuranceConditions: { type: Types.Text, label: 'Prk Excss Insrnc Cndtns' },
	perksVIPSeating: {
		type: Types.Select,
		options: availableOptions.all,
		emptyOption: false,
		default: availableOptions.unknown,
	},
	perksVIPSeatingConditions: { type: Types.Text },
	perksConcierge: {
		type: Types.Select,
		options: availableOptions.all,
		emptyOption: false,
		default: availableOptions.unknown,
	},
	perksConciergeConditions: { type: Types.Text },
	perksSpecialEvents: {
		type: Types.Select,
		options: availableOptions.all,
		emptyOption: false,
		default: availableOptions.unknown,
	},
	perksSpecialEventsConditions: { type: Types.Text, label: 'Prk Spcl Vnt Cndtns' },
	perksPartnerDiscounts: {
		type: Types.Select,
		options: availableOptions.all,
		emptyOption: false,
		default: availableOptions.unknown,
	},
	perksPartnerDiscountsConditions: { type: Types.Text, label: 'Prk Prntr Dscnt Cndtns' },
	perksAirportLounge: {
		type: Types.Select,
		options: availableOptions.all,
		emptyOption: false,
		default: availableOptions.unknown,
	},
	perksAirportLoungeConditions: { type: Types.Text, label: 'Prk Arprt Lng Cndtns' },
	perksAdditional: { type: Types.Text },
	purchaseRateStandard: { type: Types.Number, require: true, min: 0 },
	purchaseRateIntro: { type: Types.Number, min: 0 },
	purchaseRateIntroTerm: { type: Types.Number, min: 0 },
	balanceTransferStandard: { type: Types.Number, min: 0 },
	balanceTransferIntro: { type: Types.Number, min: 0 },
	balanceTransferIntroTerm: { type: Types.Number, min: 0 },
	cashAdvanceRateStandard: { type: Types.Number, min: 0, label: 'Csh Adv Rate Stndrd' },
	cashAdvanceRateIntro: { type: Types.Number, min: 0 },
	cashAdvanceRateIntroTerm: { type: Types.Number, min: 0, label: 'Csh Adv Rate Intr Trm' },
	rewardProgram: {
		type: Types.Relationship,
		ref: 'Program',
		filters: { isReward: true },
		required: false,
		initial: false,
		index: true,
		noedit: false,

	},
	pointsCap: { type: Types.Number, min: 0 },
	pointsCapFrequency: { type: Types.Number, min: 0 },
	bonusPoints: { type: Types.Number, min: 0 },
	bonusPointsConditions: { type: Types.Text, label: 'Bonus Pts Cond' },
	cardArt: imageStorage('creditcard'),
})
CreditCard.add(verifiedCommonAttribute)
CreditCard.relationship({ path: 'earnRates', ref: 'EarnRate', refPath: 'product', many: true })
CreditCard.relationship({ path: 'ChangeLogs', ref: 'ChangeLog', refPath: 'model', many: true })
CreditCard.relationship({ path: 'creditCardSpecial', ref: 'CreditCardSpecial', refPath: 'product' })

CreditCard.schema.pre('validate', function (next) {
	if (([undefined, null].indexOf(this.offerExpires) < 0) && (this.offerExpires <= new Date())) {
		next(Error('Offer Expires has to be greater than today'))
	}
	if ((this.purchaseRateIntro !== undefined) && (this.purchaseRateIntro > this.purchaseRateStandard)) {
		next(Error('Purchase rate intro should be less than purchase rate standard'))
	}
	if ((this.balanceTransferIntro !== undefined) && (this.balanceTransferIntro > this.balanceTransferStandard)) {
		next(Error('Balance transfer intro should be less than balance transfer standard'))
	}
	if ((this.cashAdvanceRateIntro !== undefined) && (this.cashAdvanceRateIntro > this.cashAdvanceRateStandard)) {
		next(Error('Cash advance rate intro should be less than cash advance rate standard'))
	}
	if (!!this.maximumBalanceTransferPercentage && (this.maximumBalanceTransferPercentage < 0 || this.maximumBalanceTransferPercentage > 100)) {
		next(Error('maximum balance transfer percentage cannot be less than 0 or greater than 100'))
	}

	next()
})

CreditCard.schema.pre('save', function (next) {
	if (!this.uuid) {
		this.uuid = uuid.v4()
	}
	this.isLowRate = this.purchaseRateStandard <= 14.0 || this.name.toLowerCase().includes('low rate')
	this.isLowFee = this.annualFeeStandard <= 50 || this.name.toLowerCase().includes('low fee')
	this.isReward = this.rewardProgram !== null
	next()
})

CreditCard.schema.index({ company: 1, name: 1 }, { unique: true })

CreditCard.schema.pre('save', async function (next) {
  await changeLogService(this)
  next()
})

CreditCard.schema.post('save', async function (next) {
	await verifiedService(this)
	next()
})

CreditCard.defaultColumns = 'name, company, uuid, isMonetized'
CreditCard.register()
