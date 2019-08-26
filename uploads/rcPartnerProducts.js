// node uploads/rcPartnerProducts.js
require('dotenv').config()
var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
var productService = require('../services/productService')
var mongoose = require('mongoose')
const newRedshiftQuery = require('../utils/newRedshiftQuery')
const redshift2Node = require('../utils/ratecityRedshiftQuery')


const PartnerProduct = keystoneShell.list('PartnerProduct')
const Partner = keystoneShell.list('Partner')

module.exports = async function () {
  let connection = await mongoosePromise.connect()
  try {
    let products = await PartnerProduct.model.find().lean()
    let sqlDelete = 'truncate table rc_partner_products'
    await newRedshiftQuery(sqlDelete)
    await redshift2Node(sqlDelete)

    for(let i=0; i < products.length; i++) {
      let product = products[i]
      let prods = await productService({uuid: product.parentUuid})
      let vertical
      if (prods['Personal Loans']) {
        vertical = 'Personal Loans'
      } else {
        vertical = Object.keys(prods)[0]
      }
      let partnerArray = product.partners.map((rec) => { return mongoose.Types.ObjectId(rec) })
      let partnerNames = (await Partner.model.distinct('name', {_id: { $in: partnerArray }})).join()
      let verticalProduct = prods[vertical][0]
      let companyObject = verticalProduct.company || {}

      let sqlInsert = `insert into rc_partner_products values
        ('${product._id}', '${product.name}', '${partnerNames}', 
        '${companyObject.name}', '${companyObject.uuid}', 
        '${product.parentUuid}', '${product.uuid}', '${vertical}',
        '${product.gotoSiteUrl}', ${product.isPhantomProduct},
        ${product.isBlacklisted}, '${product.notes || ''}', ${product.isDiscontinued})
        `
      console.log(sqlInsert)
      await newRedshiftQuery(sqlInsert)
      await redshift2Node(sqlInsert)
    }
    connection.close()
  } catch(error) {
    console.log(error)
    return error
  }
}()
