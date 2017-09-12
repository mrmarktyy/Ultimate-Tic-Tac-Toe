const keystone = require('keystone')
const csvtojson = require('../../utils/csvToJson')
const salesforceVerticals = require('../../models/helpers/salesforceVerticals')

exports.screen = async (req, res) => {
  let view = new keystone.View(req, res)
  view.render('importEcpc')
}

exports.uploadCsv = async (req, res) => {
  try {
    if (Object.keys(req.files).length === 0) {
      throw 'No upload file is specified'
    }
    let list = await csvtojson(req.files.ecpcUpload.path)
    list = validation(list)
    await updateProducts(list)
    req.flash('success', 'ecpc has been uploaded')
    return res.redirect('/import-ecpc')
  } catch (error) {
    req.flash('error', error)
    return res.redirect('/import-ecpc')
  }
}

async function updateProducts (records) {
  try {
    let collections = ecpcCollections()
    for (let i = 0; i < collections.length; i++) {
      let collection = collections[i]
      let Product = await keystone.list(collection) // eslint-disable-line babel/no-await-in-loop
      await Product.model.update({}, {$set: {ecpc: 0}}, {multi: true}) // eslint-disable-line babel/no-await-in-loop
      for (let rec = 0; rec < records.length; rec++) {
        await Product.model.update({uuid: records[rec].uuid}, {$set: {ecpc: records[rec].ecpc}}, {}).exec() // eslint-disable-line babel/no-await-in-loop
      }
    }
  } catch (error) {
    throw(error)
  }
}

const validation = (list) => {
  try {
    let lowercaseList = list.map((item) => {
      return Object.keys(item).reduce((n, k) => (n[k.toLowerCase()] = item[k], n), {})
    })
    if (lowercaseList[0].uuid === undefined | lowercaseList[0].ecpc === undefined) {
      throw('uuid and ecpc have to be included in the header.')
    }
    if (Object.keys(lowercaseList[0]).length !== 2) {
      throw('Can only have uuid and ecpc columns.')
    }
    let ecpcIsNumbers = lowercaseList.every((item) => !isNaN(item.ecpc))
    if (ecpcIsNumbers === false) {
      throw('ECPC has to be numbers')
    }
    return lowercaseList
  } catch (error) {
    throw error
  }
}

const ecpcCollections = () => {
  let collections = []
  for (let vertical in salesforceVerticals) {
    if (salesforceVerticals[vertical].collection !== 'GenericProduct') {
      collections.push(salesforceVerticals[vertical].collection)
    }
  }
  return [...new Set(collections)]
}
