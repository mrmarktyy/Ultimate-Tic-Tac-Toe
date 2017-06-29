var keystone = require('keystone')
var removeUneededFields = require('../../utils/removeUneededFields')

var SavingsAccount = keystone.list('SavingsAccount')
var SavingsAccountTier = keystone.list('SavingsAccountTier')

exports.list = async function (req, res) {
  let savingsAccounts = await SavingsAccount.model.find().populate('company').lean().exec()
  let result = await getSavingAccounts(savingsAccounts)
  res.jsonp(result)
}

async function getSavingAccounts (accounts) {
  const variations = await SavingsAccountTier.model.find().populate('product').lean().exec()

  // variations
  let result = accounts.map((account) => {
    account.variations = variations
    .filter((variation) => variation.product.uuid === account.uuid)
    .map((variation) => {
      variation = removeUneededFields(variation, ['product', 'company'])

      return variation
    })

    return removeUneededFields(account)
  })

  return result
}
