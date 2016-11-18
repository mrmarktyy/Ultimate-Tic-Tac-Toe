var keystone = require('keystone');
var salesforceVerticals = require('../../models/helpers/salesforceVerticals');

var Monetize = keystone.list('Monetize');

exports.monetize = function (req, res) {
  let products = req.body;
  let missingUUIDs = [];
  let promise;
  let promises = [];

  for (var i = 0; i < products.length; i++) {
    let change_request = products[i];
    if (typeof(salesforceVerticals[change_request.RC_Product_Type]) === 'undefined') {
      continue;
    }
    let uuid = change_request.RC_Product_ID;

    let product = keystone.list(salesforceVerticals[change_request.RC_Product_Type]);
    promise = product.model.findOne({ uuid: uuid })
    .exec()
    .then(function (product) {
      if (product === null) {
        missingUUIDs.push(uuid);
      } else if (change_request.RC_Active) {
        return (Monetize.model.findOneAndUpdate(
          {
            uuid: uuid,
            vertical: change_request.RC_Product_Type,
          },
          {
            applyUrl: change_request.RC_Url,
            product: product._id,
          },
          {
            new: true,
            upsert: true,
          })
        );
      } else {
        return (Monetize.model.findOneAndRemove(
          {
            uuid: uuid,
            vertical: change_request.RC_Product_Type,
          })
        );
      }
    })
    .catch(function (err) {
      console.log(err);
      res.jsonp({ error: err });
    });

    promises.push(promise);

  }
  Promise.all(promises).then(function () {
    if (missingUUIDs.length === 0) {
      res.status(200).jsonp({ text: 'OK' });
    } else {
      res.status(400).jsonp({ message: 'Missing UUIDs', missing: missingUUIDs });
    }
  });
};
