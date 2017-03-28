require('dotenv').config()

const logger = require('../../utils/logger')
const redshiftQuery = require('../../utils/redshiftQuery')
const moment = require('moment')

const VERTICALS = {
  'Managed Funds': 'managed funds',
  'Home Loans': 'home loans',
  'Car Loans': 'car loans',
  'Savings A/C': 'savings accounts',
  'Term Deposits': 'term deposits',
  'Superannuation': 'superannuation',
  'Transaction A/C': 'transaction accounts',
  'Credit Cards': 'credit cards',
  'Personal Loans': 'personal loans'
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();})
}

function daysInMonth(year, month) {
  let res = []
  for (let i=1; i<=moment(`${year}-${month}-01`, 'YYYY-M-DD').daysInMonth(); i++) {
    res.push(moment(`${year}-${month}-${i}`, 'YYYY-M-D').format('MM-DD'))
  }
  return res
}

function generateDays (year, month) {
  let res = {
    days: {},
    products: {},
    total: 0
  }
  daysInMonth(year, month).forEach((day) => {
    res.days[day] = {}
  })
  return res
}

async function getVerticalsAndProducts(companyName, year, month) {

  let thisMonth = moment(`${year}-${month}-01`, 'YYYY-M-DD').format('YYYY-MM-DD')
  let nextMonth = moment(`${year}-${month}-01`, 'YYYY-M-DD').add(1, 'months').format('YYYY-MM-DD')
  productsCommand = 'SELECT DISTINCT uuid, vertical, name FROM salesforce_products WHERE date_start < $1 AND date_end >= $2 AND company_name = $3'
  let result = await redshiftQuery(productsCommand, [nextMonth, thisMonth, companyName])
  let companyVerticals = {}
  let products = []

  result.forEach((result) => {
    let vertical = VERTICALS[result.vertical]
    companyVerticals[vertical] = generateDays(year, month)
    if (vertical === 'personal loans') {
      companyVerticals['car loans'] = generateDays(year, month)
      products.push(Object.assign({}, result, {vertical: 'car loans', total: 0}))
    }
    if (vertical === 'car loans') {
      companyVerticals['personal loans'] = generateDays(year, month)
      products.push(Object.assign({}, result, {vertical: 'personal loans', total: 0}))
    }
    if (vertical === 'savings accounts') {
      companyVerticals['transaction accounts'] = generateDays(year, month)
      products.push(Object.assign({}, result, {vertical: 'transaction accounts', total: 0}))
    }
    if (vertical === 'transaction accounts') {
      companyVerticals['savings accounts'] = generateDays(year, month)
      products.push(Object.assign({}, result, {vertical: 'savings accounts', total: 0}))
    }
    products.push(Object.assign(result, {vertical, total: 0}))
  })

  let promises = []
  for (let i=0; i<products.length; i++) {
    let product = products[i]
    let command = 'SELECT substring(datetime FROM 6 FOR 5) date, COUNT(*) FROM apply_clicks WHERE is_human=\'true\' AND product_uuid = $1 AND vertical = $2 and datetime >= $3 and datetime < $4 GROUP BY date'
    promises.push(redshiftQuery(command, [product.uuid, product.vertical, thisMonth, nextMonth]).then((result) => {
        result.forEach((row) => {
          companyVerticals[product.vertical].days[row.date][`${product.uuid}-${product.vertical}`] = {count: parseInt(row.count)}
          companyVerticals[product.vertical].products[`${product.uuid}-${product.vertical}`] = product
        })
      })
    )
  }

  await Promise.all(promises)

  return companyVerticals
}

module.exports = async function (companyName, year, month) {

  let companyVerticals = await getVerticalsAndProducts(companyName, year, month)

  let overallTotal = 0
  let results = []
  let products = {}

  for (let vertical in companyVerticals) {
    let verticalProducts = companyVerticals[vertical].products
    for (let product in verticalProducts) {
      let p = Object.assign({}, verticalProducts[product])
      delete p.total
      products[product] = products[product] || {product: p, days: {}}
    }
  }

  daysInMonth(year, month).forEach((day) => {
    let dayTotal = 0
    let dayResults = {}
    for (let vertical in companyVerticals) {
      let verticalDayTotal = 0
      let verticalResults = companyVerticals[vertical].days[day]
      let verticalProducts = companyVerticals[vertical].products
      for (let product in verticalProducts) {
        let dayProduct = verticalResults[product]
        let count = dayProduct ? dayProduct.count : 0
        verticalDayTotal += count
        dayTotal += count
        overallTotal += count
        dayResults[product] = count
        products[product].days[day] = count
      }
      dayResults[vertical] = verticalDayTotal
    }
    dayResults['total'] = dayTotal
    results.push(Object.assign({date: `${year}-${day}`}, dayResults))
  })
  let headings = []
  let headingTitles = []
  for (let vertical in companyVerticals) {
    let verticalProducts = companyVerticals[vertical].products
    for (let product in verticalProducts) {
      headings.unshift(product)
      headingTitles.unshift(verticalProducts[product].name)
    }
    headings.unshift(vertical)
    headingTitles.unshift(toTitleCase(`${vertical} Click Total`))
  }
  headings.unshift('total')
  headingTitles.unshift('Total Clicks')
  headings.unshift('date')
  headingTitles.unshift('Date')

  let totalRow = {}
  for (let index in headings) {
    let heading = headings[index]
    let count = 0
    for (let index in results) {
      let day = results[index]
      count += parseInt(day[heading])
    }
    totalRow[heading] = count
  }
  totalRow['date'] = 'Total Clicks'
  results.push(totalRow)
  let mappings = {}
  for (let i = 0; i<headings.length; i++) {
    mappings[headings[i]] = headingTitles[i]
  }
  return {days: results, mappings: mappings, products: Object.values(products)}
}
