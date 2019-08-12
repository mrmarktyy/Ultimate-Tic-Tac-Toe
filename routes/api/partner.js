const keystone = require('keystone')

const Partner = keystone.list('Partner')

exports.list = async function (req, res) {
  const partners = await Partner.model.find(
      {},
      { updatedBy: 0, _id: 0, updatedAt: 0, createdBy: 0, createdAt: 0, __v: 0 },
    ).lean()
  res.jsonp(partners)
}