const moment = require('moment-timezone')
const jsforce = require('jsforce')
const fetch = require('node-fetch')

exports.list = async function (req, res) {
  const username = process.env.SALESFORCE_USERNAME
  const password = process.env.SALESFORCE_PASSWORD
  const clientId = process.env.SALESFORCE_KEY
  const secret = process.env.SALESFORCE_SECRET
  const todaysDate = moment().tz('Australia/Sydney').format('YYYY-MM-DD')

  let authenticationBody = 'grant_type=password'
  authenticationBody += '&client_id=' + clientId
  authenticationBody += '&client_secret=' + secret
  authenticationBody += '&username=' + username
  authenticationBody += '&password=' + password

  const response = await fetch(process.env.SALESFORCE_LOGIN_URL, {
    method: 'POST',
    body: authenticationBody,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
  })

  let jsonResponse = await response.json()

  var conn = new jsforce.Connection({
    instanceUrl: jsonResponse.instance_url,
    accessToken: jsonResponse.access_token,
  })

  const countResult = await conn.query(`Select RC_Product_ID__c, RC_No_of_Clicks__c, RC_Start_Date__c from RC_Clicks__c where RC_Start_Date__c >= ${todaysDate}`)

  const clickCounts = countResult.records.map((record) => {
    return {
      clickCount: record.RC_No_of_Clicks__c,
      productId: record.RC_Product_ID__c,
      date: record.RC_Start_Date__c,
    }
  })

  const productResult = await conn.query('select RC_Product_ID__c, Id from RC_Console_Product__c where RC_Product_Active__c = True')

  const products = productResult.records.map((record) => {
    return {
      productId: record.Id,
      productUuid: record.RC_Product_ID__c,
    }
  })

  res.jsonp({
    clickCounts,
    products,
  })
}
