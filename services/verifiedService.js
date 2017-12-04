var mongoose = require('mongoose')
var  keystone = require('keystone')
module.exports = async function (model) {
	let collectionName = model.constructor.modelName
	let Model = mongoose.model(collectionName)
	if (model.verified) {
		await Model.findOneAndUpdate({ _id: model._id }, {
			verifiedBy: model.updatedBy,
			verifiedAt: model.updatedAt,
			verified: false
		}).lean().exec()
	}
	return model
}
