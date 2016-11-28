var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var monetizeSchema = new Schema( {
	uuid: String,
	vertical: String,
	applyUrl: String,
	enabled: Schema.Types.Boolean,
	product: Schema.Types.ObjectId,
} );

monetizeSchema.index({ uuid: 1, vertical: 1 }, { unique: true });
module.exports = mongoose.model('Monetize', monetizeSchema);
