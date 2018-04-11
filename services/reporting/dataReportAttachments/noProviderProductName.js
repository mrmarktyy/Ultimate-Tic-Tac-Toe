require('dotenv').config()

var keystoneShell = require('../../../utils/keystoneShell')
const fs = require('fs')
const json2csv = require('json2csv')

const HomeLoanVariation = keystoneShell.list('HomeLoanVariation')

module.exports = async function noProviderProductName (filePath) {
  let variations = await HomeLoanVariation.model.find({providerProductName: null}).populate('company product').lean().exec()
  variations = variations.sort((a, b) => {
    return a.company.name.toLowerCase().localeCompare(b.company.name.toLowerCase()) || a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  })
  let records = []
  variations.forEach((v) => {
    let obj = {
      company: v.company.name,
      companyUuid: v.company.uuid,
      homeloan: v.product.name,
      homeloanUuid: v.product.uuid,
      variation: v.name,
      variationUuid: v.uuid,
    }
    records.push(obj)
  })

  let result = null
  if (records.length) {
    let csv = json2csv({data: records})
    let fileName = `no-provider-product-name.csv`
    fs.writeFileSync(filePath + fileName, csv)
    result =  {path: `${filePath}${fileName}`}
  }
  return result
}
