// node uploads/salesforceArchiveProducts.js
require('dotenv').config()

var csvToJson = require('../utils/csvToJson')
const csvFilePath = './tmp/salesforceproducts.csv'

const redshiftQuery = require('../utils/redshiftQuery')
const salesforceClient = require('../services/salesforceClient')

// format uuid, vertical, companyuuid, name, visible, archived, goto
module.exports = async function () {
  try {
    let client = new salesforceClient()
    let verticals = {}
    let uuids = []
    const data = await csvToJson(csvFilePath)
    let dataToArchive = data.filter((item) => { return item.archived === '0'})
    for (let item of dataToArchive) {
      let obj = {}
      obj.uuid = item.uuid
      obj.vertical = item.vertical
      obj.company = { uuid: item.companyuuid }
      obj.name = item.name
      obj.isDiscontinued = true
      obj.goToSite = item.active === '1'
      obj.applyUrl = item.url
      if (verticals[item.vertical] === undefined) {
        verticals[item.vertical] = []
      }
      verticals[item.vertical].push(obj)
      uuids.push(item.uuid)
    }

    // check redshift for last month on uuids. if salesforce env = prod
    if (process.env.SALESFORCE_LOGIN_URL === 'https://ap2.salesforce.com/services/oauth2/token') {
      let command = `
        select product_uuid, count(1) from apply_clicks
        where product_uuid in ${inlist(uuids)}
        and datetime >= '2018-02-01'
        group by product_uuid
      `
      console.log(command)
      let rows = await redshiftQuery(command)
      if (rows.length > 0) {
        console.log(rows)
        throw 'apply clicks affected'
      }
    }
    console.log(verticals)
    for (let vertical in verticals) {
      console.log(vertical)
      let status = await client.pushProducts(vertical, verticals[vertical])
      console.log(status)
    }
    return 0
  } catch (error) {
    console.log(error)
    return error
  }
}()

function inlist(list) {
  if (list.length > 0) {
    let result = '('
    list.forEach((item) => {
      result += `'${item}',`
    })
    result = result.slice(0, -1)
    result += ')'
    return result
  } else {
    return '()'
  }
}
