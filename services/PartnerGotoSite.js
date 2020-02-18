// node services/PartnerGotoSite.js
require('dotenv').config()
var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')
const PartnerProduct = keystoneShell.list('PartnerProduct')

class PartnerGotoSite {
  constructor (vertical) {
   this.partnerproducts = {}
   this.vertical = vertical
   return (async () => {
      this.value = await this.populatePartners(this.vertical)
      return this
   })()
  }

  async populatePartners (verticals) {
    if (typeof verticals === 'string') {
      verticals = [verticals]
    }
    let connection = await mongoosePromise.connect()
    try {
      let products = await PartnerProduct.model.find({isPhantomProduct: false, isBlacklisted: false, vertical: {$in: verticals}, isDiscontinued: false}).populate('partners').lean().exec()
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
  let xx = await new PartnerGotoSite(['car-loans'])
  let partners = await xx.findPartners('a6a51106-8ca6-41e1-a842-4df8b46f6424')
  console.log(partners)
  return(0)
}

// run()
module.exports = PartnerGotoSite
