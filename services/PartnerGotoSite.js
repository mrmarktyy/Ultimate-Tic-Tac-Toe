// node services/PartnerGotoSite.js
require('dotenv').config()
var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
const PartnerProduct = keystoneShell.list('PartnerProduct')

class PartnerGotoSite {
  constructor (vertical) {
    this.partnerproducts = {}
    this.vertical = vertical
  }

  async populatePartners () {
    let connection = await mongoosePromise.connect()
    try {
      let products = await PartnerProduct.model.find({isPhantomProduct: false, isBlacklisted: false, vertical: this.vertical, isDiscontinued: false}).populate('partners').lean().exec()
      connection.close()
      products.forEach((product) => {
        this.partnerproducts[product.parentUuid] = product.partners.map((partner) => { return partner.name})
      })
      return Object.keys(this.partnerproducts)
    } catch (e) {
      return (0)
    }
  }

  findPartners (parentUuid) {
    return this.partnerproducts[parentUuid] || []
  }
}

async function run() {
  let xx = new PartnerGotoSite('credit-cards')
  let partners = (await xx.findPartners('2381aa63-3895-4747-b711-f554aa5c870e'))
  console.log(partners)
  return(0)
}

//run()
module.exports = PartnerGotoSite
