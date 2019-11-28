var keystone = require('keystone')
var _ = require('lodash')
const recommendedMultiplier = require('../../utils/recommendedMultiplier').multiplier
var monetizedCollection = require('./monetizedCollection')
var logger = require('../../utils/logger')
const HomeLoanVariation = keystone.list('HomeLoanVariation')

class HomeLoanList {
  constructor () {
    this.flattenprefix = {
      providerProductName: 'provider_',
      product: '',
      company: 'company_',
    }
  }

  async process () {
    try {
      let variations = await this.getVariations()
      variations = this.flattenNested(variations, this.flattenprefix)
      let monetizedVariations = await monetizedCollection('Home Loans')
      let offsetAccounts = await this.getHomeLoanAccessory('OffsetAccount')
      let redrawFacilities = await this.getHomeLoanAccessory('RedrawFacility')
      let fees = await this.getHomeLoanAccessory('Fee')
      let features = await this.getHomeLoanAccessory('Feature')
      let conditions = await this.getHomeLoanAccessory('Condition')
      let extraRepayments = await this.getHomeLoanAccessory('ExtraRepayment')
      let companyVerticals = await this.getHomeLoanAccessory('CompanyHomeLoan')
      Object.keys(companyVerticals).forEach((id) => {
        companyVerticals[id].forEach((obj) => {
          obj.big4ComparisonProductUuid = obj.big4ComparisonProduct ? obj.big4ComparisonProduct.uuid : null
        })
      })

      let records = []
      variations.forEach((variation) => {
        variation = this.spawnVariation(variation, monetizedVariations, companyVerticals)
        let product_id = variation.product_id.toString()
        let company_id = variation.company_id.toString()

        records.push(_.merge(
          {},
          variation,
          {
            offsetAccounts: offsetAccounts[product_id] || [],
            redrawfacilities: redrawFacilities[product_id] || [],
            fees: fees[product_id] || [],
            features: features[product_id] || [],
            conditions: conditions[product_id] || [],
            extraRepayments: extraRepayments[product_id] || [],
            companyVertical: companyVerticals[company_id] || [],
          },
        ))
      })
      return records
    } catch (error) {
      logger.error(`homeloan api ${error}`)
      return 'database error'
    }
  }

  async getVariations () {
    let variations = await HomeLoanVariation.model.find(
      { $or: [ { isDiscontinued: false }, { isDiscontinued: {$exists: false} } ] },
      { updatedBy: 0, createdBy: 0, verified: 0, verifiedBy: 0, verifiedAt: 0, updatedAt: 0, createdAt: 0, __v: 0 })
    .populate({path: 'providerProductName', select: '-_id -updatedAt -createdAt -updatedBy -createdBy -__v -company'})
    .populate({
      path: 'product', select: '-updatedAt -createdAt -createdBy -updatedBy -__v -verified -verifiedBy -verifiedAt -neo4jId -isDiscontinued -slug -name -company -displayName -promotedOrder'}
    )
    .populate({ path: 'company', select: '_id name uuid logo favicon classificationType userHasOffers slug' })
    .populate({ path: 'revertVariation' })
    .lean()

    return variations
  }

  async getHomeLoanAccessory (modelName) {
    let obj = {}
    let model = keystone.list(modelName).model
    let records = await model.find({},
       {createdBy: 0, createdAt: 0, updatedBy: 0, updatedAt: 0, _id: 0, __v: 0 }
    ).populate('product', '_id isDiscontinued')
    .lean()
    if (modelName != 'CompanyHomeLoan') {
      records = records.filter((record) => {
        return record.product.isDiscontinued === false
      })
      records.forEach((datum) => {
        let id = datum.product._id.toString()
        delete datum.product
        delete datum.company
        obj[id] = obj[id] || []
        obj[id].push(datum)
      })
    } else {
      records.forEach((datum) => {
        let id = datum.company.toString()
        delete datum.company
        obj[id] = obj[id] || []
        obj[id].push(datum)
      })
    }
    return obj
  }

  flattenNested (records, fields = {}) {
    let obj = {}
    return records.map((record) => {
      obj = { product_uuid: record.product.uuid }
      Object.keys(fields).forEach((field) => {
        Object.keys(record[field]).forEach((key) =>{
          if (key === '_id') {
            obj[`${field}${key}`] = record[field][key]
          } else {
            obj[`${fields[field]}${key}`] = record[field][key]
          }
        })
        delete record[field]
      })
      return _.merge({}, obj, record)
    })
  }

  spawnVariation (variation, monetizedVariations, companyVerticals) {
    if (variation.company_logo) {
      if (variation.company_logo) {
        variation.company_logo = variation.company_logo.url.replace('http://res.cloudinary.com/ratecity/image/upload', '//production-ultimate-assets.ratecity.com.au/ratecity/image/upload')
      }
    }
    if (variation.company_favicon) {
      if (variation.company_favicon) {
        variation.company_favicon = variation.company_favicon.url
      }
    }

    variation.company_isBank = variation.company_classificationType.some((type) => type.toLowerCase().includes('bank'))
    variation.company_hasOffersEnabled = variation.company_userHasOffers
    delete variation.company_userHasOffers
    variation.gotoSiteUrl = null
    variation.gotoSiteEnabled = false
    variation.recommendScore = (variation.monthlyClicks ? variation.monthlyClicks * recommendedMultiplier : 0)
    delete variation.monthlyClicks

    if (variation.revertVariation) {
      variation.revertRate = variation.revertVariation.rate
      delete variation.revertVariation
    }

    let monetize = monetizedVariations[variation._id]
    if (monetize) {
      variation.gotoSiteUrl = monetize.applyUrl
      variation.gotoSiteEnabled = monetize.enabled
      variation.paymentType = monetize.paymentType
    }

    variation.big4ComparisonProduct = null
    if (companyVerticals[variation.company_id]) {
      variation.big4ComparisonProduct = companyVerticals[variation.company_id][0].big4ComparisonProduct
    }
    return _.omit(variation, ['_id'])
  }
}

exports.list = async function (req, res) {
  let hl = new HomeLoanList()
  let result = await hl.process()
  res.jsonp(result)
}
