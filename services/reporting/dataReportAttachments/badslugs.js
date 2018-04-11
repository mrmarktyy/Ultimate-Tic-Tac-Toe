require('dotenv').config()

var keystoneShell = require('../../../utils/keystoneShell')
const productService = require('../../productService')
const fs = require('fs')
const json2csv = require('json2csv')

const ALL_SPECIALS = [
  'CreditCardSpecial', 'HomeLoanSpecial', 'PersonalLoanSpecial',
  'SavingsAccountSpecial', 'TermDepositSpecial',
]

module.exports = async function badslugs (filePath) {
  let collections = await productService({$or: [{slug: /.*-duplicate/}, {name: /.*duplicate/}]}, {isDiscontinued: 1})
  let slugs = []
  for (let vertical in collections) {
    let products = collections[vertical]
    for (let i = 0; i < products.length; i++) {
      let product = products[i]
      let obj = {
        vertical: vertical,
        company: product.company.name,
        name: product.name,
        uuid: product.uuid,
        slug: product.slug,
        isMonetized: product.isMonetized ? product.isMonetized : false,
        isDiscontinued: product.isDiscontinued,
      }
      slugs.push(obj)
    }
  }

  slugs = slugs.concat(await specialsBadSlug())
  let result = null
  if (slugs.length) {
    let csv = json2csv({data: slugs})
    let fileName = `bad-slugs.csv`
    fs.writeFileSync(filePath + fileName, csv)
    result =  {path: `${filePath}${fileName}`}
  }
  return result
}

async function specialsBadSlug () {
  let specials = []
  let slugs = []
  for(let i = 0; i < ALL_SPECIALS.length; i++) {
    let special = ALL_SPECIALS[i]
    let model = await keystoneShell.list(special).model // eslint-disable-line babel/no-await-in-loop
    let collection = await model.find({name: /.*duplicate/}).populate('company product').lean().exec() // eslint-disable-line babel/no-await-in-loop
    if (collection.length) {
      specials[special] = collection
    }
  }
  for (let collection in specials) {
    let items = specials[collection]
    for (let i = 0; i < items.length; i++) {
      let special = items[i]
      let obj = {
        vertical: collection,
        company: special.company.name,
        name: special.name,
        uuid: null,
        isMonetized: null,
        slug: special.slug,
        isDiscontinued: null,
      }
      slugs.push(obj)
    }
  }
  let result = []
  if (slugs.length) {
    result = slugs
  }
  return result
}

