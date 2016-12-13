var keystone = require('keystone');
var uuid = require('node-uuid');
var availableOptions = require('../attributes/availableOptions');
var productCommonAttributes = require('../common/ProductCommonAttributes');
var imageStorage = require('../helpers/fileStorage');
var logger = require('../../utils/logger');

var Types = keystone.Field.Types;

var CreditCard = new keystone.List('CreditCard');

CreditCard.add(productCommonAttributes);

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
		options: ['Visa', 'MasterCard', 'AMEX', 'Diners Club', 'Visa - AMEX', 'MasterCard - AMEX'],
		required: true,
		initial: true,
	},
	cardLevel: {
		type: Types.Select,
		options: ['Standard', 'Gold', 'Platinium', 'Premium'],
		default: 'Standard',
		emptyOption: false,
		required: true,
	},
	isLowRate: { type: Types.Boolean, indent: true, noedit: true },
	isLowFee: { type: Types.Boolean, indent: true, noedit: true },
	isReward: { type: Types.Boolean, indent: true, noedit: true },
	isSpecial: { type: Types.Boolean, indent: true, default: false },
	isRateCitySpecial: { type: Types.Boolean, indent: true, default: false },
	offerExpires: { type: Types.Date },
	interestFreeDays: { type: Types.Number, min: 0 },
	minimumRepaymentDollars: { type: Types.Number, min: 0, label: 'Min Rpymnt Dllrs' },
	minimumRepaymentPercent: { type: Types.Number, min: 0, label: 'Min Rpymnt Prcnt' },
	minimumCreditLimit: { type: Types.Number, min: 0 },
	maximumCreditLimit: { type: Types.Number, min: 0 },
	numberFreeSupplementary: { type: Types.Number, min: 0, label: 'Nmbr Free Sppl' },
	otherBenefits: { type: Types.Text },
	otherRestrictions: { type: Types.Text },
	adminNotes: { type: Types.Text },
	annualFeeIntro: { type: Types.Number, min: 0 },
	annualFeeIntroTerm: { type: Types.Number, min: 0 },
	annualFeeStandard: { type: Types.Number, min: 0 },
	annualFeeSpendWaiver: { type: Types.Number, min: 0 },
	annualFeeSpendWaiverTerm: { type: Types.Number, min: 0, label: 'Annul Fee Spnd Wvr Trm' },
	annualFeeOtherWaiver: { type: Types.Text },
	balanceTransferFeeDollards: { type: Types.Number, min: 0, label: 'Blnc Trnsf Fee Dllrs' },
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
	availableTo457Visa: { type: Types.Select, options: availableOptions.all },
	eligibilityConditions: { type: Types.Text },
	instantApproval: { type: Types.Select, options: availableOptions.all },
	perksFreeDomesticTravelInsurance: {
		type: Types.Select,
		options: availableOptions.all,
		label: 'Prk Free Dmstc Trvl Ins',
	},
	perksFreeDomesticTravelInsuranceConditions: { type: Types.Text, label: 'Prk Free Dmstc Trvl Ins Cnd' },
	perksFreeInternationalTravelInsurance: {
		type: Types.Select,
		options: availableOptions.all,
		label: 'Prk Free Intn Trvl Ins',
	},
	perksFreeInternationalTravelInsuranceConditions: { type: Types.Text, label: 'Prk Free Intn Trvl Ins Cnd' },
	perksFreeTravelInsuranceDays: { type: Types.Number, min: 0, label: 'Prk Free Trvl Insrnc Dys' },
	perksFreeTravelInsuranceDaysConditions: { type: Types.Text, label: 'Prk Free Trvl Insrnc Dys Cnd' },
	perksFreeSupplementaryCards: { type: Types.Select, options: availableOptions.all, label: 'Prk Free Sppl Crd' },
	perksFreeSupplementaryCardsConditions: { type: Types.Text, label: 'Prk Free Sppl Crd Cdtns' },
	perksPurchaseProtection: { type: Types.Select, options: availableOptions.all },
	perksPurchaseProtectionDays: { type: Types.Number, label: 'Prk Prchs Prtctn Dys' },
	perksPurchaseProtectionConditions: { type: Types.Text, label: 'Prk Prchs Prtctn Cndtns' },
	perksPriceGuarantee: { type: Types.Select, options: availableOptions.all },
	perksPriceGuaranteeConditions: { type: Types.Text, label: 'Prk Prc Grnt Cndtns' },
	perksExtendedWarranty: { type: Types.Select, options: availableOptions.all },
	perksExtendedWarrantyConditions: { type: Types.Text, label: 'Prk Extndd Wrrnty Cndtns' },
	perksRentalCarExcessInsurance: { type: Types.Select, options: availableOptions.all, label: 'Prk Excss Insrnc' },
	perksRentalCarExcessInsuranceConditions: { type: Types.Text, label: 'Prk Excss Insrnc Cndtns' },
	perksVIPSeating: { type: Types.Select, options: availableOptions.all },
	perksVIPSeatingConditions: { type: Types.Text },
	perksConcierge: { type: Types.Select, options: availableOptions.all },
	perksConciergeConditions: { type: Types.Text },
	perksSpecialEvents: { type: Types.Select, options: availableOptions.all },
	perksSpecialEventsConditions: { type: Types.Text, label: 'Prk Spcl Vnt Cndtns' },
	perksPartnerDiscounts: { type: Types.Select, options: availableOptions.all },
	perksPartnerDiscountsConditions: { type: Types.Text, label: 'Prk Prntr Dscnt Cndtns' },
	perksAirportLounge: { type: Types.Select, options: availableOptions.all },
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
	pointsCapFrequency: { type: Types.Number, min: 1 },
	earnRateVisaMcTier1: { type: Types.Number, min: 0 },
	earnRateVisMcTier1Limit: { type: Types.Number, min: 0, label: 'Ern Rate Vis Mc Tier1 Lmt' },
	earnRateVisMcTier1LimitFrequency: { type: Types.Number, min: 1, label: 'Ern Rate Vis Mc Tr2 Lim Fre' },
	earnRateVisMcTier2: { type: Types.Number, min: 0 },
	earnRateVisaMcTier2Limit: { type: Types.Number, min: 0, label: 'Ern Rate Visa Mc Tr2 Lmt' },
	earnRateAmexTier1: { type: Types.Number, min: 0 },
	earnRateAmexTier1Limit: { type: Types.Number, min: 0, label: 'Ern Rate Amex Tr1 Lmt' },
	earnRateAmexTier1LimitFrequency: { type: Types.Number, min: 1, label: 'Ern Rate Amex Tr1 Lmt Frq' },
	earnRateAmexTier2: { type: Types.Number, min: 0 },
	earnRateAmexTier2Limit: { type: Types.Number, min: 0, label: 'Ern Rate Amex Tr2 Lmt' },
	bonusPoints: { type: Types.Number, min: 0 },
	bonusPointsConditions: { type: Types.Text, label: 'Bonus Pts Cond' },
	cardArt: imageStorage('creditcard'),
});

CreditCard.schema.pre('validate', function (next) {
	if (([undefined, null].indexOf(this.offerExpires) < 0) && (this.offerExpires <= new Date())) {
		logger.error(this.offerExpires);
		next(Error('Offer Expires has to be greater than today'));
	}
	if ((this.purchaseRateIntro !== undefined) && (this.purchaseRateIntro > this.purchaseRateStandard)) {
		next(Error('Purchase rate intro should be less than purchase rate standard'));
	}
	if ((this.balanceTransferIntro !== undefined) && (this.balanceTransferIntro > this.balanceTransferStandard)) {
		next(Error('Balance transfer intro should be less than balance transfer standard'));
	}
	if ((this.cashAdvanceRateIntro !== undefined) && (this.cashAdvanceRateIntro > this.cashAdvanceRateStandard)) {
		next(Error('Cash advance rate intro should be less than cash advance rate standard'));
	}

	next();
});


CreditCard.schema.pre('save', function (next) {
	if (!this.uuid) {
		this.uuid = uuid.v4();
	}
	this.isLowRate = this.purchaseRateStandard <= 14.0;
	this.isLowFee = this.annualFeeStandard <= 50;
	this.isReward = this.rewardProgram === undefined ? false : true;

	next();
});

CreditCard.schema.index({ company: 1, name: 1 }, { unique: true });

CreditCard.track = true;
CreditCard.defaultColumns = 'name, company, uuid';
CreditCard.register();
