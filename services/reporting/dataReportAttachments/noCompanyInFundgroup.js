require('dotenv').config()

var keystoneShell = require('../../../utils/keystoneShell')
const fs = require('fs')
const json2csv = require('json2csv')

const FundGroup = keystoneShell.list('FundGroup')

module.exports = async function noCompanyInFundgroup (filePath) {
  let fundgroups = await FundGroup.model.find({company: {$exists: false}}).lean().exec()
  let records = []
  fundgroups.forEach((fund) => {
    let obj = {
      name: fund.name,
      fundName: fund.fundName,
      groupName: fund.groupName,
      slug: fund.slug,
      uuid: fund.uuid,
    }
    records.push(obj)
  })

  let result = null
  if (records.length) {
    let csv = json2csv({data: records})
    let fileName = `no-company-in-fundgroup.csv`
    fs.writeFileSync(filePath + fileName, csv)
    result =  {path: `${filePath}${fileName}`}
  }
  return result
}
