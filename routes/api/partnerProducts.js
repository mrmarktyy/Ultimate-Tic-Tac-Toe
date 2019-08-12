const keystone = require('keystone')

const PartnerProduct = keystone.list('PartnerProduct')

exports.list = async function (req, res) {
  const partnerProducts = await PartnerProduct.model.find(
      { isDiscontinued: false },
      { updatedBy: 0, _id: 0, updatedAt: 0, createdBy: 0, createdAt: 0, __v: 0 },
    ).populate({path: 'partners', select: '-_id -updatedBy -updatedAt -createdBy -isDiscontinued -__v'})
    .lean()
  res.jsonp(partnerProducts)
}