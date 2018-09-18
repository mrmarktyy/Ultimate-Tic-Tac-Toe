module.exports = function (product) {
  let flexibilityScore = 0
  const score = {} // This is only for debugging purpose
  if (product.extrarepaymentsallowed) {
    flexibilityScore += 20
    score['allowsExtraRepayments'] = 20
    if (parseInt(product.extrarepaymentsvalue) === 0) {
      score['extraRepaymentsValue'] = 5
      flexibilityScore += 5
    }
  }
  if (product.hasfulloffset) {
    score['hasFullOffset'] = 5
    flexibilityScore += 5
  }
  if (product.hasoffsetaccount) {
    score['hasOffsetAccount'] = 5
    flexibilityScore += 5
  }
  if (product.hasredrawfacility) {
    score['hasRedrawFacility'] = 5
    flexibilityScore += 5
    if (product.redrawactivationfee === 0) {
      score['redrawActivationFee'] = 5
      flexibilityScore += 5
    } else if (product.redrawactivationfee && product.redrawactivationfee <= 20) {
      score['redrawActivationFee'] = 3
      flexibilityScore += 3
    }
  }

  if (product.hastransactionaccount) {
    score['hasTransactionAccount'] = 1
    flexibilityScore += 1
  }
  if (product.hascreditcard) {
    score['hasCreditCard'] = 7
    flexibilityScore += 7
  }
  if (product.hasdebitcard) {
    score['hasDebitCard'] = 2
    flexibilityScore += 2
  }
  if (product.hasatmwithdrawals) {
    score['hasATMWithdrawals'] = 1
    flexibilityScore += 1
  }
  if (product.haseftposwithdrawals) {
    score['hasEFTPOSWithdrawals'] = 1
    flexibilityScore += 1
  }
  if (product.haschequebook) {
    score['hasChequeBook'] = 1
    flexibilityScore += 1
  }
  if (product.hasphonewithdrawals) {
    score['hasPhoneWithdrawals'] = 1
    flexibilityScore += 1
  }
  if (product.hasinternetwithdrawals) {
    score['hasInternetWithdrawals'] = 1
    flexibilityScore += 1
  }

  if (product.allowssplitloan) {
    score['allowsSplitLoan'] = 7
    flexibilityScore += 7
  }
  if(product.hasconstructionfacility){
    score['hasConstructionFacility'] = 5
    flexibilityScore += 5
  }

  if (product.hasprincipalandinterest && product.hasinterestonly) {
    score['PI_IO'] = 5
    flexibilityScore += 5
  }

  let repaymentScore = 0
  if (product.hasweeklyrepayments) {
    repaymentScore++
  }
  if (product.hasfortnightlyrepayments) {
    repaymentScore++
  }
  if (product.hasmonthlyrepayments) {
    repaymentScore++
  }
  if (repaymentScore === 3) {
    repaymentScore = 5
  }
  score['repaymentScore'] = repaymentScore
  flexibilityScore += repaymentScore

  if (product.hasmortgageportability) {
    flexibilityScore += 2
    score['hasMortgagePortability'] = 2
    if (!(product.portabilitytransferfee === null)) {
      if (product.portabilitytransferfee === 0) {
        score['zeroPortabilityTransferFee'] = 5
        flexibilityScore += 5
      } else if (product.portabilitytransferfee <= 300) {
        score['portabilityTransferFee300'] = 3
        flexibilityScore += 3
      } else if (product.portabilitytransferfee <= 500) {
        score['portabilityTransferFee500'] = 1
        flexibilityScore += 1
      }
    }
  }

  if (product.hasrepayholiday) {
    score['hasRepayHoliday'] = 3
    flexibilityScore += 3
  }

  return flexibilityScore
}
