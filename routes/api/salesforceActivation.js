var keystone = require('keystone');

var Monetize = keystone.list('Monetize');

exports.monetize = function (req, res) {
  let verticals = { 'Car Loans': 'CarLoan', 'Personal Loans': 'PersonalLoan' };
  let deliveryType = { goToSite: 0, brokerLeadForm: 1, compareMore: 2 };
  let products = req.body;
  let missingUUIDs = [];
  let promise;
  let promises = [];

  for (var i = 0; i < products.length; i++) {
    let change_request = products[i];
    if (typeof(verticals[change_request.RC_Product_Type]) === 'undefined') {
      continue;
    }
    let uuid = change_request.RC_Product_ID;

    let product = keystone.list(verticals[change_request.RC_Product_Type]);
    promise = product.model.findOne({ uuid: uuid })
    .exec()
    .then(function (product) {
      if (product === null) {
        missingUUIDs.push(uuid);
      } else {
        let delivery;
        if (change_request.RC_Active) {
          delivery = deliveryType.goToSite;
        } else {
          delivery = deliveryType.compareMore;
        }

        return (Monetize.model.findOneAndUpdate(
          {
            uuid: uuid,
            vertical: change_request.RC_Product_Type,
          },
          {
            deliveryType: delivery,
            applyUrl: change_request.RC_Url,
            active: change_request.RC_Active,
            product: product._id,
          },
          { new: true,
            upsert: true,
          })
        );
      }
    })
    .catch(function (err) {
      console.log(err);
      res.jsonp('{error:error}');
    });

    promises.push(promise);

  }
  Promise.all(promises).then(function () {
    if (missingUUIDs.length === 0) {
      console.log('in 200');
      res.status(200).jsonp({ text: 'OK' });
    } else {
      res.status(400).jsonp({ message: 'Missing UUIDs', missing: missingUUIDs });
    }
  });
};
