var keystone = require('keystone');

var PersonalLoan = keystone.list('PersonalLoan');
var PersonalLoanVariation = keystone.list('PersonalLoanVariation');
var CompanyPersonalLoan = keystone.list('CompanyPersonalLoan');


exports.list = function (req, res) {

  let promise = PersonalLoan.model.find().populate('company').lean().exec();

  let response = {}
  let variationPromises = []
  promise.then(function (personalLoans) {
    personalLoans.forEach(function (personalLoan) {
      let promise = PersonalLoanVariation.model.find({product: personalLoan._id}).lean().exec(function (err, variation) {
        if (err) return 'database error'
        personalLoan['variations'] = variation
        response[personalLoan._id] = Object.assign({}, personalLoan, response[personalLoan._id], {variations: variation})
      });
      variationPromises.push(promise)

      let plcPromise = CompanyPersonalLoan.model.find({company: personalLoan.company._id}).lean().exec(function (err, plc) {
        if (err) return 'database error'
        personalLoan['companyVertical'] = plc
        response[personalLoan._id] = Object.assign({}, personalLoan, response[personalLoan._id], {companyVertical: plc})
      });
      variationPromises.push(plcPromise)
    });

    Promise.all(variationPromises).then(()=> {
      let result = []
      for (let key in response) {
        result.push(response[key])
      }
      res.jsonp(result);
    })
  });
}

exports.one = function (req, res) {

  let id = req.params.id;
  let promise = PersonalLoan.model.findById(id).populate('company').lean().exec();

  promise.then(function (personalLoan) {
    if(personalLoan == null){
      res.jsonp('{error: id not found }');
      return
    }
    PersonalLoanVariation.model.find({product: personalLoan._id}).lean().exec(function (err, variation) {
      if (err) return 'database error'
      personalLoan['variations'] = variation
      res.jsonp(personalLoan);
    });
  }).catch(function(e){
      console.log(e)
    res.jsonp('{error:error}');
  })
}
