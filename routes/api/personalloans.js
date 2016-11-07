var async = require('async');
var keystone = require('keystone');

var PersonalLoan = keystone.list('PersonalLoan');
var PersonalLoanVariation = keystone.list('PersonalLoanVariation');


exports.list = function (req, res) {

  let promise = PersonalLoan.model.find().populate('company').lean().exec();

  let response = []
  let variationPromises = []
  promise.then(function (personalLoans) {
    personalLoans.forEach(function (personalLoan) {
      let promise = PersonalLoanVariation.model.find({product: personalLoan._id}).lean().exec(function (err, variation) {
        if (err) return 'database error'
        personalLoan['variations'] = variation
        response.push(personalLoan)
      });
      variationPromises.push(promise)
    });

    Promise.all(variationPromises).then(()=> {
      res.jsonp(response);
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
