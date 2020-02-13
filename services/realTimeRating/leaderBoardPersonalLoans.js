// node ./services/realTimeRating/LeaderBoardPersonalLoans.js

const redshiftQuery = require('../../utils/ratecityRedshiftQuery')
const awsUploadToS3 = require('../../utils/awsUploadToS3')
const json2csv = require('json2csv')
var keystoneShell = require('../../utils/keystoneShell')
var mongoosePromise = require('../../utils/mongoosePromise')
var Leaderboard = keystoneShell.list('Leaderboard')
const moment = require('moment')

class leaderBoardPersonalLoan {
	constructor () {
    this.collectionDate = '2018-01-01' //placeholding value
    this.Ratings = []
    this.currentLeaderboard = ''
    this.previousLeaderDashBoard = ''
    this.vertical = ''
  }

  async process (leaderData) {
    let {
      collectionDate = moment().format('YYYY-MM-DD'),
      leaderboardSlugs = [],
      vertical = 'Personal Loans',
    } = leaderData
    this.collectionDate = collectionDate
    this.vertical = vertical
    let leaderboardFilter = {vertical: vertical, isDiscontinued: false}
    if (leaderboardSlugs.length) {
     Object.assign(leaderboardFilter, {slug: {$in: leaderboardSlugs}})
    }
    console.log(`${vertical} for ${collectionDate}`)

    let connection = await mongoosePromise.connect()
    try {
      let leaderboards = await Leaderboard.model.find(leaderboardFilter).lean().exec()
      for (let i=0; leaderboards.length > i; i++) {
        let leaderboardRankings = []
        this.currentLeaderboard = leaderboards[i]
        this.Ratings = await this.getRatings()
        leaderboardRankings = this.leaderRank()
        leaderboardRankings = await this.addPreviousPosition(leaderboardRankings)

        if (leaderboardRankings.length) {
          let filename = `${vertical}_${this.collectionDate}_${this.currentLeaderboard.slug}.csv`
          await this.insertIntoRedshift(leaderboardRankings, Object.keys(leaderboardRankings[0]), filename, `personal_loans_leaderboard_history`)
        }
      }
      connection.close()    
    } catch(error) {
      connection.close()
      return error
    }
  }
  async getRatings () {
    let verticalfilter = this.vertical === 'Personal Loans'? `and h.ispersonalloan = 'YES'`: `and h.iscarloan = 'YES'`
    let sql = `
    select r.*,
      ROW_NUMBER() OVER (ORDER BY r.overallrating desc, r.variationuuid asc) as variationposition
      from personal_loans_history as h
      inner join personal_loans_variations_history v
        on v.collectiondate = h.collectiondate
        and v.uuid = h.uuid
      inner join personal_loans_ratings_history r
        on r.collectiondate = h.collectiondate
        and r.variationuuid = v.variationuuid
        and r.vertical = '${this.vertical}'
        and r.collectiondate = '${this.collectionDate}'
      where h.collectiondate = '${this.collectionDate}'
      ${verticalfilter}
      and ${this.currentLeaderboard.ultimateFilterCriteria}
      and h.description not like '%(Marketplace)%'
      and h.isdiscontinued = false
      order by r.overallrating desc, r.variationuuid asc
    `
    let ratings = await redshiftQuery(sql)
  // console.log(sql)
    // console.log(ratings.length)
    return ratings
  }

  leaderRank () {
    let records = []
    this.Ratings.forEach((rating) => {
      let obj = {
        vertical: this.vertical,
        slug: this.currentLeaderboard.slug,
        collectiondate: moment(rating.collectiondate).format('YYYY-MM-DD'),
        uuid: rating.uuid,
        variationuuid: rating.variationuuid,
        companyuuid: rating.companyuuid,
        userloanamount: rating.userloanamount,
        averagemonthlycost: parseFloat(rating.averagemonthlycost),
        costrating: parseFloat(rating.costrating),
        flexibilityscore: Math.round(parseFloat(rating.flexibilityscore)),
        flexibilityrating: parseFloat(rating.flexibilityrating),
        overallrating: Math.round(rating.overallrating * 100) / 100,
        variationposition: rating.variationposition,
        variationpositionprevious: 0,
        variationsince: 0,
        productposition: 0,
        productpositionprevious: 0,
        productsince: 0,
        companyposition: 0,
        companypositionprevious: 0,
        companysince: 0,
      }
      records.push(obj)
    })
    let providerUUIDs = []
    let companyUUIDs = []
    records = records.map((record) => {
      let UUIDposition = 0
      if (!providerUUIDs.includes(record.uuid)) {
        providerUUIDs.push(record.uuid)
        UUIDposition = providerUUIDs.length
      }
      let companyposition = 0
      if (!companyUUIDs.includes(record.companyuuid)) {
        companyUUIDs.push(record.companyuuid)
        companyposition = companyUUIDs.length
      }
      return Object.assign(record, {productposition: UUIDposition, companyposition: companyposition})
    })
    return records
  }

  async addPreviousPosition (records) {
    let previousDate = moment(this.collectionDate).subtract(1, 'day').format('YYYY-MM-DD')
    let sql = `
      select * from personal_loans_leaderboard_history
      where collectionDate = '${previousDate}'
      and slug = '${this.currentLeaderboard.slug}'
      and vertical = '${this.vertical}'
      order by productposition desc
    `

    let previousDash = await redshiftQuery(sql)
    let previousCompany = previousDash.filter((record) => record.companyposition > 0)
    let previousProvider = previousDash.filter((record) => record.productposition > 0)
    if (previousDash.length) {
      records = records.map((record) => {
        let variationsince = 0, variationpositionprevious = 0
        let previous = previousDash.find((prev) => {
          return (prev.slug === record.slug && prev.variationuuid === record.variationuuid && prev.variationposition > 0)
        })
        if (previous) {
          variationpositionprevious = previous.variationpositionprevious
          variationsince = parseInt(record.variationposition) === previous.variationposition ? previous.variationsince + 1 : 0
        }
        let productsince = 0, productpositionprevious = 0
        if (record.productposition) {
          previous = previousProvider.find((prev) => prev.slug === record.slug && prev.uuid === record.uuid)
          if (previous) {
            if (previous.productposition !== parseInt(record.productposition)) {
              productpositionprevious = previous.productposition
              productsince = 0
            } else {
              productpositionprevious = previous.productpositionprevious
              productsince = previous.productsince + 1
            }
          }
        }
        let companypositionprevious = 0, companysince = 0
        if (record.companyposition) {
          previous = previousCompany.find((prev) => prev.slug === record.slug && prev.companyuuid === record.companyuuid)
          if (previous) {
            if (previous.companyposition !== parseInt(record.companyposition)) {
              companypositionprevious = previous.companyposition
              companysince = 0
            } else {
              companypositionprevious = previous.companypositionprevious
              companysince = previous.companysince + 1
            }
          }
        }

        return Object.assign(record,
          {
            variationpositionprevious: variationpositionprevious,
            variationsince: variationsince,
            productpositionprevious: productpositionprevious,
            productsince: productsince,
            companypositionprevious: companypositionprevious,
            companysince: companysince,
          })
      })
    }
    return records
  }

  async insertIntoRedshift (rows, headers, filename, table) {
    if (rows.length > 0) {
      let csv = json2csv({data: rows, fields: headers, hasCSVColumnTitle: false})
      await awsUploadToS3(`${table}/${process.env.RATECITY_REDSHIFT_DATABASE}/${filename}`, csv, 'redshift-2node')

      let command = `delete from ${table} where collectiondate = '${this.collectionDate}' and slug = '${this.currentLeaderboard.slug}' and vertical = '${this.vertical}'`
      await redshiftQuery(command)
      command = `copy ${table} from 's3://redshift-2node/${table}/${process.env.RATECITY_REDSHIFT_DATABASE}/${filename}' credentials 'aws_access_key_id=${process.env.S3_KEY};aws_secret_access_key=${process.env.S3_SECRET}' NULL AS 'null' EMPTYASNULL CSV ACCEPTINVCHARS TRUNCATECOLUMNS COMPUPDATE OFF`
      await redshiftQuery(command)
    }
  }

  async rollingDelete (days=183) {
    let enddate = moment(this.collectionDate).subtract(days, 'days').format('YYYY-MM-DD')
    let command = `delete from personal_loans_leaderboard_history where collectiondate < '${enddate}' and vertical = '${this.vertical}'`
    await redshiftQuery(command)
  }
}

async function runDashboard () {
  let current = moment('2019-06-01')
  //current = moment().startOf('day').subtract(1, 'day')
  let endDate = moment().subtract(1, 'day').format('YYYY-MM-DD')
  let dashboard = new leaderBoardPersonalLoan()
  while (current.isSameOrBefore(endDate)) {
    await dashboard.process({collectionDate: current.format('YYYY-MM-DD'), vertical: 'Personal Loans'})
    await dashboard.process({collectionDate: current.format('YYYY-MM-DD'), vertical: 'Car Loans'})
    //await dashboard.process({collectionDate: current.format('YYYY-MM-DD'), vertical: 'Car Loans', leaderboardSlugs: ['best-broker-car-loans']})
    current.add(1, 'day')
  }
  console.log('ran dashboard')
  return 0
}

// runDashboard()

module.exports = leaderBoardPersonalLoan
