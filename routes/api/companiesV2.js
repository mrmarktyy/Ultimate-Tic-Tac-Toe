var keystone = require('keystone')

const Company = keystone.list('Company')
const CompanyHomeLoan = keystone.list('CompanyHomeLoan')
const CompanyPersonalLoan = keystone.list('CompanyPersonalLoan')
const CompanySavingsAccount = keystone.list('CompanySavingsAccount')
const CompanyTermDeposit = keystone.list('TermDepositCompany')

const MULTIPLIER = 5.32

exports.list = async function (req, res) {
  let allCompanies = []
	let companies = await Company.model.find({ $or: [ { isDiscontinued: false }, { isDiscontinued: {$exists: false} } ] }).lean().exec()

  let hlvariationStats = await modelStats('HomeLoanVariation')
  let personalStats = await modelStats('PersonalLoan', { isPersonalLoan: 'YES' })
  let carStats = await modelStats('PersonalLoan', { isCarLoan: 'YES' })
  let ccStats = await modelStats('CreditCard')
  let saStats = await modelStats('SavingsAccount')
  let supStats = await modelStats('Superannuation', { superannuation: true })
  let penStats = await modelStats('Superannuation', { pension: true })
  let bankStats = await modelStats('BankAccount')
  let termStats = await modelStats('TermDeposit')

  for (let i=0; companies.length > i; i++) {
    let response = companyDetails()
    let company = companies[i]
    let companyId = company._id.toString()

    let { count: hlCount = 0, populatityScore: hlPopulatityScore = 0 } = hlvariationStats[companyId] || {}
    let hlCompany = await CompanyHomeLoan.model.findOne({company: companyId}).populate('big4ComparisonProduct').lean()
    if (hlCompany) {
      response[`homeloans_hasRepaymentWidget`] = hlCompany['hasRepaymentWidget'] ? hlCompany['hasRepaymentWidget'] : null
      response[`homeloans_big4ComparisonProductUuid`] = (hlCompany['big4ComparisonProduct'] || null) && hlCompany['big4ComparisonProduct'].uuid
    }
    response['homeloans_variation_count'] = hlCount
    response['homeloans_popularityScore'] = +(hlPopulatityScore).toFixed(2)

    let plCompany = await CompanyPersonalLoan.model.findOne({company: companyId}).populate('big4ComparisonProduct').lean()
    if (plCompany) {
      response['personalloans_blurb'] = plCompany['personalLoanBlurb'] || ''
      response[`personalloans_hasRepaymentWidget`] = plCompany['hasRepaymentWidget'] ? plCompany['hasRepaymentWidget'] : null
      response[`personalloans_big4ComparisonProductUuid`] = (plCompany['big4ComparisonProduct'] || null) && plCompany['big4ComparisonProduct'].uuid
      response['carloans_blurb'] = plCompany['carLoanBlurb'] || ''
      response[`carloans_hasRepaymentWidget`] = plCompany['hasRepaymentWidget'] ? plCompany['hasRepaymentWidget'] : null
      response[`carloans_big4ComparisonProductUuid`] = (plCompany['big4ComparisonProduct'] || null) && plCompany['big4ComparisonProduct'].uuid
    }
    let { count: plCount = 0, populatityScore: plPopulatityScore = 0 } = personalStats[companyId] || {}
    response['personalloans_count'] = plCount
    response['personalloans_popularityScore'] = +(plPopulatityScore).toFixed(2)
    let { count: carCount = 0, populatityScore: carPopulatityScore = 0 } = carStats[companyId] || {}
    response['carloans_count'] = carCount
    response['carloans_popularityScore'] = +(carPopulatityScore).toFixed(2)

    let { count: ccCount = 0, populatityScore: ccPopulatityScore = 0 } = ccStats[companyId] || {}
    response['creditcards_count'] = ccCount
    response['creditcards_popularityScore'] = +(ccPopulatityScore).toFixed(2)

    let saCompany = await CompanySavingsAccount.model.findOne({company: companyId}).populate('big4ComparisonProduct').lean()
    if (saCompany) {
      response['savingsaccounts_blurb'] = saCompany['blurb'] || ''
      response[`savingsaccounts_hasRepaymentWidget`] = saCompany['hasRepaymentWidget'] ? saCompany['hasRepaymentWidget'] : null
      response[`savingsaccounts_big4ComparisonProductUuid`] = (saCompany['big4ComparisonProduct'] || null) && saCompany['big4ComparisonProduct'].uuid
    }
    let { count: saCount = 0, populatityScore: saPopulatityScore = 0 } = saStats[companyId] || {}
    response['savingsaccounts_count'] = saCount
    response['savingsaccounts_popularityScore'] = +(saPopulatityScore).toFixed(2)

    let { count: supCount = 0, populatityScore: supPopulatityScore = 0 } = supStats[companyId] || {}
    response['superannuation_count'] = supCount
    response['superannuation_popularityScore'] = +(supPopulatityScore).toFixed(2)

    let { count: penCount = 0, populatityScore: penPopulatityScore = 0 } = penStats[companyId] || {}
    response['pensions_count'] = penCount
    response['pensions_popularityScore'] = +(penPopulatityScore).toFixed(2)

    let { count: bankCount = 0, populatityScore: bankPopulatityScore = 0 } = bankStats[companyId] || {}
    response['bankaccounts_count'] = bankCount
    response['bankaccounts_popularityScore'] = +(bankPopulatityScore).toFixed(2)

    let termCompany = await CompanyTermDeposit.model.findOne({company: companyId}).populate('big4ComparisonProduct').lean()
    if (termCompany) {
      response['termdeposits_blurb'] = termCompany['blurb'] || ''
      response[`termdeposits_hasRepaymentWidget`] = termCompany['hasRepaymentWidget'] ? termCompany['hasRepaymentWidget'] : null
    }
    let { count: termCount = 0, populatityScore: termPopulatityScore = 0 } = termStats[companyId] || {}
    response['termdeposits_count'] = termCount
    response['termdeposits_popularityScore'] = +(termPopulatityScore).toFixed(2)

    response['verticals'] = getVerticals(response)
    allCompanies.push({...company, ...response})
  }
  res.jsonp(allCompanies)
}

async function modelStats (modelName, extraFilter = null) {
  let obj = {}
  let keystoneModel = keystone.list(modelName)
  let match = { $match: { $or: [ { isDiscontinued: false }, { isDiscontinued: {$exists: false} } ] } }
  if (extraFilter) {
    Object.keys(extraFilter).forEach((key) => {
      match['$match'][key] = extraFilter[key]
    })
  }
  let data =  await keystoneModel.model.aggregate([
    match,
    { $group: { _id: '$company', count: { $sum: 1 }, clicks: {$sum: '$monthlyClicks'} } },
    { $project: { _id: 0, company_id: '$_id', count: 1, clicks: 1, populatityScore: {$multiply: ['$clicks', MULTIPLIER]} } },
  ])
  data.forEach((datum) => {
    obj[datum['company_id']] = datum
  })
  return obj
}

function companyDetails () {
  return {
    homeloans_hasRepaymentWidget: null,
    homeloans_big4ComparisonProductUuid: null,
    homeloans_variation_count: 0,
    homeloans_popularityScore: 0,
    personalloans_blurb: null,
    personalloans_hasRepaymentWidget: null,
    personalloans_big4ComparisonProductUuid: null,
    personalloans_count: 0,
    personalloans_popularityScore: 0,
    carloans_blurb: null,
    carloans_hasRepaymentWidget: null,
    carloans_big4ComparisonProductUuid: null,
    carloans_count: 0,
    carloans_popularityScore: 0,
    creditcards_count: 0,
    creditcards_popularityScore: 0,
    savingsaccounts_blurb: null,
    savingsaccounts_hasRepaymentWidget: null,
    savingsaccounts_count: 0,
    savingsaccounts_popularityScore: 0,
    superannuation_count: 0,
    superannuation_popularityScore: 0,
    pensions_count: 0,
    pensions_popularityScore: 0,
    bankaccounts_count: 0,
    bankaccounts_popularityScore: 0,
    termdeposits_blurb: null,
    termdeposits_hasRepaymentWidget: null,
    termdeposits_big4ComparisonProductUuid: null,
    termdeposits_count: 0,
    termdeposits_popularityScore: 0,
    verticals: [],
  }
}

function getVerticals (verticalInfo) {
  let verticals = []
  Object.keys(verticalInfo).forEach((key) => {
    let vertical = key.match(/^([a-z]*?)(s_|_).*count$/)
    if (vertical && verticalInfo[key] > 0) {
      verticals.push(vertical[1])
    }
  })
  return verticals
}