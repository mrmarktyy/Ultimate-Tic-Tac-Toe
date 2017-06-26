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
  const tiers = await SavingsAccountTier.model.find().populate('product').lean().exec()

  // tiers
  let result = accounts.map((account) => {
    account.tiers = tiers
    .filter((tier) => tier.product.uuid === account.uuid)
    .map((tier) => {
      tier = removeUneededFields(tier, ['product', 'company'])

      return tier
    })

    return removeUneededFields(account)
  })

  return result
}
