'use strict'
const keystone = require('keystone')
const ALLVERTICALS = require('../../models/helpers/salesforceVerticals')
const Company = keystone.list('Company')
const Redirect = keystone.list('Redirect')

exports.screen = (req, res) => {
  var view = new keystone.View(req, res)
  var locals = res.locals
  locals.section = 'home'
  view.render('companyRedirects')
}

exports.redirects = async (req, res) => {
  let results = {}
  try {
    let companyUuid = req.body.uuid
    let oldSlug = req.body.oldSlug
    let startDate = new Date()
    let status = req.body.responseStatus
    let comment = req.body.comment

    if (!(companyUuid && oldSlug && comment)) {
      throw 'uuid, oldSlug & comment must be filled out'
    }
    results = 'No company found with uuid ' + companyUuid
    let company = await Company.model.findOne({ uuid: companyUuid }).lean().exec()
    if (company) {
      if (company.slug === oldSlug) {
        throw 'oldSlug cannot equal new slug'
      }
      results = await createRedirects(company, oldSlug, startDate, comment, status)
    }
    return res.status(200).json({ data: results, flashcode: true })
  } catch (error) {
    return res.status(200).json({flashmessage: error})
  }
}

exports.getCompany = async (req, res) => {
  let uuid = req.body.uuid
  let validUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  let company = {}
  if (validUUID.test(uuid)) {
    company = await Company.model.findOne({uuid: uuid}).lean().exec()
  }
  return res.status(200).json(company)
}

async function createRedirects (company, oldSlug, startDate, comment, status) {
  let results = {}
  let records = []
  let companyPage = {
    from: `/companies/${oldSlug}`,
    to: `/companies/${company.slug}`,
    startDate: startDate,
    status: status,
    notes: comment,
  }
  records.push(companyPage)
  for (let vertical in ALLVERTICALS) {
    if (ALLVERTICALS[vertical].collection !== 'GenericProduct') {
      let collection = keystone.list(ALLVERTICALS[vertical].collection)
      let findClause = ALLVERTICALS[vertical].findClause || {}
      findClause.isDiscontinued = false
      findClause.company = company._id
      let products = await collection.model.find(findClause).lean().exec()
      if (products.length > 0) {
        let companyVertical= {
          from: `/${verticalHyphened(vertical)}/${oldSlug}`,
          to: `/${verticalHyphened(vertical)}/${company.slug}`,
          startDate: startDate,
          status: status,
          notes: comment,
        }
        records.push(companyVertical)
        for (let i=0; i < products.length; i++) {
          let row = products[i]
          let verticalUrl = verticalHyphened(vertical)
          let product = {
            from: `/${verticalUrl}/${oldSlug}/${row.slug}`,
            to: `/${verticalUrl}/${company.slug}/${row.slug}`,
            startDate: startDate,
            status: status,
            notes: comment,
          }
          records.push(product)
        }
        results[vertical] = products.length
      }
    }
  }
  await Redirect.model.insertMany(records)
  return results
}

function verticalHyphened (vertical) {
  return vertical.replace(/\s+/g, '-').toLowerCase()
}
