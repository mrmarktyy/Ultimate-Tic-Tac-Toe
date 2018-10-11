require('dotenv').config()

var keystoneShell = require('../../../utils/keystoneShell')
const productService = require('../../productService')
const fs = require('fs')
const json2csv = require('json2csv')
const HomeLoanVariation = keystoneShell.list('HomeLoanVariation')

module.exports = async function discontinuedHomeLoanRevert (filePath) {
  let variations = await HomeLoanVariation.model.find({isDiscontinued: false, revertVariation: {$ne: null}}).populate('revertVariation company product')
  let discontinued = variations.filter((variation) => {
    return variation.revertVariation.isDiscontinued === true
  })
  let records = []
  discontinued.forEach((record) => {
    let obj = {
      companyName: record.company.name,
      companyUUID: record.company.uuid,
      variationName: record.name,
      variationUUID: record.uuid,
      revertVariationName: record.revertVariation.name,
      revertVariationUUID: record.revertVariation.uuid,
    }
    records.push(obj)
  })

  let result = null
  if (records.length) {
    let csv = json2csv({data: records})
    let fileName = `discontinued_hl_revertvariations.csv`
    fs.writeFileSync(filePath + fileName, csv)
    result =  {path: `${filePath}${fileName}`}
  }
  return result
}
