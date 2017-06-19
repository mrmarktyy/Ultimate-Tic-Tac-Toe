const keystone = require('keystone')
const json2csv = require('json2csv')
const csvtojson = require('csvtojson')
const _ = require('lodash')

const HomeLoanVariation = keystone.list('HomeLoanVariation')
const Company = keystone.list('Company')

const headings = [
  {label: 'CompanyName', value: 'company.name', update: false},
  {label: 'HomeLoanUUID', value: 'product.uuid', update: false},
  {label: 'HomeLoanName', value: 'product.name', update: false},
  {label: 'VariationUUID', value: 'uuid', update: false},
  {label: 'VariationName', value: 'name', update: false},
  {label: 'Rate', value: 'rate', update: true},
  {label: 'ComparisonRate', value: 'comparisonRate', update: true},
  {label: 'CalculatedComparisonRate', value: 'calculatedComparisonRate', update: false},
  {label: 'MinLVR', value: 'minLVR', update: true},
  {label: 'MaxLVR', value: 'maxLVR', update: true},
  {label: 'MinTotalLoanAmount', value: 'minTotalLoanAmount', update: true},
  {label: 'MaxTotalLoanAmount', value: 'maxTotalLoanAmount', update: true},
  {label: 'FixMonth', value: 'fixMonth', update: true},
  {label: 'IntroductoryRate', value: 'introductoryRate', update: true},
  {label: 'IntroductoryTerm', value: 'introductoryTerm', update: true},
]

exports.downloadCsv = async (req, res) => {
  let companyUuid = req.body.companyName
  let companyId = await Company.model.findOne({uuid: companyUuid}, {_id: 1})
  let variations = await HomeLoanVariation.model.find({isDiscontinued: false, company: companyId}).populate('company product').lean().exec()
  let csv = json2csv({data: variations, fields: headings})

  res.set({'Content-Disposition': 'attachment; filename=homeloanvariations.csv'})
  res.set('Content-Type', 'text/csv')
  res.status(200).send(csv)
}

exports.uploadCsv = async (req, res) => {
  try {
    if (Object.keys(req.files).length === 0) {
      throw 'No upload file is specified'
    }
    let variationList = await csvToJsonConversion(req.files.variationfileUpload.path)
    let company = await checkCompany(variationList)
    let variationCount = await updateVariations(variationList, req)
    req.flash('success', 'Variations for ' + company.name + ' saved ' + variationCount)
    return res.redirect('/import-rates')
  } catch (error) {
    req.flash('error', error)
    return res.redirect('/import-rates')
  }
}

async function updateVariations (list, req) {
  try {
    for (let i=0; i < list.length; i++) {
      let item = list[i]
      let variation = await HomeLoanVariation.model.findOne({uuid: item.VariationUUID}).exec() // eslint-disable-line babel/no-await-in-loop
      variation.set(updateFields(item))
      await keystoneUpdateHandler(variation, req) // eslint-disable-line babel/no-await-in-loop
    }
    return list.length
  } catch (err) {
    throw err
  }
}

function keystoneUpdateHandler (variation, req) {
  let updateHandler = variation.getUpdateHandler(req)
  return new Promise((resolve, reject) => {
    updateHandler.process(variation, (err) => {
      if (err) {
        reject('variation UUID ' + variation.uuid + ' ' + err.detail)
      } else {
        resolve()
      }
    })
  })
}

function updateFields (item) {
  let itemKeys = Object.keys(item)
  let nameConversion = {}
  headings.forEach((item) => nameConversion[item.label] = item.value)
  let updateablekeys =  headings.filter((field) => field.update).map((field) => field.label)
  let selectedKeys = updateablekeys.filter((e) => itemKeys.indexOf(e) > 0)
  let update = {}
  selectedKeys.forEach((key) =>{
    let value = item[key] === '' ? null : parseFloat(item[key])
    update[nameConversion[key]] = value
  })
  return update
}

async function csvToJsonConversion (csvFilePath) {
  let list = []
  return new Promise((resolve) => {
    csvtojson()
      .fromFile(csvFilePath)
      .on('end_parsed', (jsonArray) => {
          list = jsonArray
      })
      .on('done', (error) => {
        resolve(list)
      })
  })
}

async function checkCompany (list) {
  try {
    let companyName = _.uniq(list.map((item) => item.CompanyName))
    if (companyName.length > 1) {
      throw('You can only have 1 company in a variations list')
    }
    let company = await Company.model.findOne({name: companyName}, {_id: 1, name: 1}).lean().exec()
    let variationUUIDs = list.map((item) => item.VariationUUID)
    if (variationUUIDs.length === 0) {
      throw 'there is no variationUUIDs provided'
    }
    let badrecords = await HomeLoanVariation.model.find({uuid: {$in: variationUUIDs}, company: {$ne: company._id}}).populate('company').lean().exec()
    if (badrecords.length >= 1) {
      throw('You specified ' + company.name + ' but variation uuid ' + badrecords[0].uuid + ' belonging to ' + badrecords[0].company.name)
    }
    return company
  } catch (error) {
    throw error
  }
}
