var keystone = require('keystone');

var FeaturedProduct = keystone.list('FeaturedProduct');
var logger = require('../../utils/logger');

exports.list = function (req, res) {
  let datenow = new Date();
  FeaturedProduct.model.find({
    $or: [
        { dateStart: { $lte: datenow }, enabled: true, dateEnd: null },
        { dateStart: { $lte: datenow }, enabled: true, dateEnd: { $gte: datenow } },
      ] },
      { uuid: 1, vertical: 1, title: 1, description: 1, sortOrder: 1, image: 1 }
    )
    .lean()
    .exec()
    .then(function (products) {
      res.jsonp(products);
    }).catch(function (e) {
      logger.error(e);
      res.jsonp({ error: e });
    });
};
