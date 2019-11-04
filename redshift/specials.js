require('dotenv').config()

var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')

const json2csv = require('json2csv')
const moment = require('moment')
const awsUploadToS3 = require('../utils/awsUploadToS3')
const redshiftQuery = require('../utils/ratecityRedshiftQuery')

const allSpecials = [
    'HomeLoan',
    'CreditCard',
    'PersonalLoan',
    'SavingsAccount',
    'BankAccount',
    'TermDeposit',
  ]

const specials = async function () {
  let connection = await mongoosePromise.connect()
  try {
    const collectionDateTime = moment()
    const collectionDate = collectionDateTime.format('YYYY-MM-DD')
    let records = await getSpecials(collectionDateTime)
    await prepDataAndPushToRedshift(collectionDate, records)
    connection.close()
  } catch (error) {
    console.log(error)
    connection.close()
    return error
  }
}

async function prepDataAndPushToRedshift (collectionDate, records) {
  const products = []
  const filename = `specials-${collectionDate}`

  records.forEach((special) => {
    let specialObj = {}
    specialObj.collectionDate = collectionDate
    specialObj.id = special._id.toString()
    specialObj.vertical = special.vertical
    specialObj.companyuuid = special.company ? special.company.uuid : null
    specialObj.companyname = special.company ? special.company.name : null
    specialObj.productuuid = special.product ? special.product.uuid : null
    specialObj.productname = special.product ? special.product.name : null
    specialObj.variationuuid = special.variation ? special.variation.uuid : null
    specialObj.variationname = special.variation ? special.variation.name : null
    specialObj.specialsUrl = special.SpecialsUrl
    specialObj.blurb = special.blurb
    specialObj.introText = special.introText
    specialObj.type = special.type
    specialObj.defaultType = special.defaultType ? special.defaultType : null
    specialObj.name = special.name
    specialObj.startdate = convertDateTime(special.startDate)
    specialObj.enddate = convertDateTime(special.endDate)
    specialObj.promotedorder = special.promotedOrder
    specialObj.cashback = special.cashBack ? special.cashBack : null
    specialObj.bonusffpoints = special.bonusFFPoints ? special.bonusFFPoints : null
    specialObj.bonusffpointsper100kLoan = special.bonusFFPointsPer100kLoan ? special.bonusFFPointsPer100kLoan : null
    specialObj.ffredemptionprogram = special.FFRedemptionProgram ? special.FFRedemptionProgram.name : null
    specialObj.filename = filename
    products.push(specialObj)
  })
  if (products.length) {
    await insertIntoRedshift(products, Object.keys(products[0]), filename, 'specials_history')
  }
}

async function insertIntoRedshift (rows, headers, filename, table) {
  if (rows.length > 0) {
    let csv = json2csv({data: rows, fields: headers, hasCSVColumnTitle: false})
    await awsUploadToS3(`specials-history/${process.env.REDSHIFT_DATABASE}/${filename}`, csv, 'redshift-2node')

    let command = `delete from ${table} where filename = $1`
    await redshiftQuery(command, [filename])
    command = `copy ${table} from 's3://redshift-2node/specials-history/${process.env.REDSHIFT_DATABASE}/${filename}' credentials 'aws_access_key_id=${process.env.S3_KEY};aws_secret_access_key=${process.env.S3_SECRET}' EMPTYASNULL CSV ACCEPTINVCHARS TRUNCATECOLUMNS`
    await redshiftQuery(command)
  }
}

async function getSpecials (collectionDateTime) {
  let records = []
  for (let special of allSpecials) {
    let modelName = special + 'Special'
    let model = keystoneShell.list(modelName).model
    let data = await model.find({
      $or: [
        {startDate: {$lte: collectionDateTime.valueOf()}, $and: [{endDate: {$exists: true}}, {endDate: {$gte: new Date()}}]},
        {startDate: {$lte: collectionDateTime.valueOf()}, endDate: null},
        {startDate: {$lte: collectionDateTime.valueOf()}, endDate: {$exists: false}},
      ],
    }, {updatedBy: 0, updatedAt: 0, createdBy: 0, createdAt: 0}) //eslint-disable-line
    .populate('company product variation FFRedemptionProgram')
    .lean()
    .exec()
    let specs = data.map(item => Object.assign(item, { vertical: special }))
    records.push(...specs)
  }
  return records
}

function convertDateTime (dt) {
  let converted = null
  if (dt) {
    converted = moment(dt, 'YYYY-MM-DDTHH:mm:ss:SSSZ').format('YYYY-MM-DD HH:mm:ss')
  }
  return converted
}

module.exports =  specials