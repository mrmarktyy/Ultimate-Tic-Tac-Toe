require('dotenv').config()
var fetch = require('node-fetch')
const logger = require('./logger')

module.exports = async function (vertical, loanAmount, months, products) {
  try {
    let verticalSuffix = vertical.replace(/\s+/g, '-').toLowerCase()
    let url = `${process.env.RTR_URL}/rest/rtr/${verticalSuffix}`
    let body = {
      products: products,
      borrowAmount: loanAmount,
      loanTerm: months,
    }

    let rtr = await fetchRealTimeRatings(url, body)
    return rtr
  }  catch (error) {
    logger.error(error)
    return error
  }
}

async function fetchRealTimeRatings (url, body) {
  let response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })

  // console.log(response.headers)
  if (response.status !== 200) {
		console.log(`Personal Loan RTR ${url} returned status: ${response.status}`)
		return null
  }
  let output = await response.json()
	return output.products
}
