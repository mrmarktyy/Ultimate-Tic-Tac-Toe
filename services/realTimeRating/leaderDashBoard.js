// node ./services/realTimeRating/leaderDashBoard.js

const redshiftQuery = require('../../utils/ratecityRedshiftQuery')
const awsUploadToS3 = require('../../utils/awsUploadToS3')
const json2csv = require('json2csv')
var keystoneShell = require('../../utils/keystoneShell')
var mongoosePromise = require('../../utils/mongoosePromise')
var Leaderboard = keystoneShell.list('Leaderboard')
const moment = require('moment')

class leaderDashBoard {
	constructor () {
    this.collectionDate = '2018-01-01' //placeholding value
    this.homeLoanRatings = []
    this.currentLeaderboard = ''
    this.previousLeaderDashBoard = ''
  }

  async process (leaderData) {
    let {
      collectionDate = moment().format('YYYY-MM-DD'),
      leaderboardSlugs = [],
    } = leaderData
    this.collectionDate = collectionDate
//    let leaderboardFilter = {flexibilityWeighting: 0.3}
    let leaderboardFilter = {}
    if (leaderboardSlugs.length) {
     Object.assign(leaderboardFilter, {slug: {$in: leaderboardSlugs}})
    }

    let connection = await mongoosePromise.connect()
    try {
      let leaderboards = await Leaderboard.model.find(leaderboardFilter).lean().exec()
      for (let i=0; leaderboards.length > i; i++) {
        let dashboardRankings = []
        this.currentLeaderboard = leaderboards[i]
        this.homeLoanRatings = await this.getHomeLoanRatings()
        dashboardRankings = this.leaderRank(this.currentLeaderboard.ultimateFilterCriteria.includes(`homeloantype = 'FIXED'`))
        dashboardRankings = await this.addPreviousPosition(dashboardRankings)
        if (dashboardRankings.length) {
          let filename = `dashboard_${this.collectionDate}_${this.currentLeaderboard.slug}.csv`
          await this.insertIntoRedshift(dashboardRankings, Object.keys(dashboardRankings[0]), filename, 'dashboard_ranking_history')
        }
      }
      connection.close()    
    } catch(error) {
      connection.close()
      return error
    }

  }

  async getHomeLoanRatings () {
    let sql = `
      select * from home_loans_history as h
      inner join home_loans_ratings_history r on r.collectiondate = h.collectiondate
      and r.variationuuid = h.variationuuid
      and r.collectiondate = '${this.collectionDate}'
      where h.collectiondate = '${this.collectionDate}'
      and ${this.currentLeaderboard.ultimateFilterCriteria}
    `
    let ratings = await redshiftQuery(sql)
    console.log(sql)
    console.log(ratings.length)
    return ratings
  }

  leaderRank (interestOnly = false) {
    let averagemonthlycost, costrating, overallRating, costWeighting = 0
    let records = []
    this.homeLoanRatings.forEach((rating) => {
      let obj = {}
      let flexibilityWeighting = this.currentLeaderboard.flexibilityWeighting || .3
      if (interestOnly) {
        averagemonthlycost  = rating.ioaveragemonthlycost
        costrating =  rating.iocostrating
      } else {
        averagemonthlycost  = rating.defaultaveragemonthlycost
        costrating =  rating.defaultcostrating
      }
      overallRating = parseFloat((costrating * (1 - flexibilityWeighting) + rating.flexibiltyrating * flexibilityWeighting).toFixed(2))
      costWeighting = 1 - flexibilityWeighting
      let cost = costrating * costWeighting
      let flexibility = rating.flexibiltyrating * ( 1 - costWeighting)
      obj = {
        slug: this.currentLeaderboard.slug,
        collectiondate: moment(rating.collectiondate).format('YYYY-MM-DD'), 
        uuid: rating.uuid,
        variationuuid: rating.variationuuid,
        provideruuid: rating.providerproductuuid,
        userloanamount: rating.userloanamount,
        averagemonthlycost: parseFloat(averagemonthlycost),
        costrating: parseFloat(costrating),
        flexibilityscore: parseFloat(rating.flexibilityscore),
        flexibilityrating: parseFloat(rating.flexibiltyrating),
        cost: Math.round(cost * 100)/100,
        flexibility: Math.round(flexibility * 100)/100,
        overallrating: Math.round(overallRating * 100)/100,
        variationposition: 0,
        variationpositionprevious: 0,
        variationsince: 0,
        providerproductposition: 0,
        providerproductpositionprevious: 0,
        providerproductsince: 0,
      }
      records.push(obj)
    })

    let providerUUIDs = []
    records = records.sort((a, b) => a.overallrating == b.overallrating ? 0 : +(b.overallrating > a.overallrating) || -1 )
    records = records.map((record, index) => {
      let providerproductposition = 0
      if (!providerUUIDs.includes(record.provideruuid)) {
        providerUUIDs.push(record.provideruuid)
        providerproductposition = providerUUIDs.length
      }
      return Object.assign(record, {variationposition: index + 1, providerproductposition: providerproductposition})
    })
    return records
  }

  async addPreviousPosition (records) {
    let previousDate = moment(this.collectionDate).subtract(1, 'day').format('YYYY-MM-DD')
    let sql = `
      select * from dashboard_ranking_history
      where collectionDate = '${previousDate}'
      and slug = '${this.currentLeaderboard.slug}'
      order by providerproductposition desc
    `
    let previousDash = await redshiftQuery(sql)
    if (previousDash.length) {
      records = records.map((record) => {
        let varationdays = 0
        let variationpositionprevious = 0
        let providerproductpositionprevious = 0
        let previous = previousDash.find((prev) => {
          return (prev.slug === record.slug && prev.variationuuid === record.variationuuid && prev.variationposition === record.variationposition)
        })
        if (previous) {
          varationdays = previous.variationsince + 1
          variationpositionprevious = previous.variationposition
        } else {
          previous = previousDash.find((prev) => {
            return (prev.slug === record.slug && prev.variationuuid === record.variationuuid)
          })
          variationpositionprevious = previous ? previous.variationposition || 0 : 0
        }
        let productdays = 0
        if (record.providerproductposition) {
          previous = previousDash.find((prev) => {
            return (prev.slug === record.slug && prev.uuid === record.uuid && prev.providerproductposition === record.providerproductposition)
          })
          if (previous) {
            productdays = previous.providerproductsince + 1
            providerproductpositionprevious = previous.providerproductposition
          } else {
            previous = previousDash.find((prev) => {
              return (prev.slug === record.slug && prev.uuid === record.uuid && prev.providerproductposition > 0)
            })
            providerproductpositionprevious = previous ? previous.providerproductposition || 0 : 0
          }
        }
        return Object.assign(record, {variationpositionprevious: variationpositionprevious, variationsince: varationdays, providerproductpositionprevious: providerproductpositionprevious, providerproductsince: productdays})
      })
    }
    return records
  }

  async insertIntoRedshift (rows, headers, filename, table) {
    if (rows.length > 0) {
      let csv = json2csv({data: rows, fields: headers, hasCSVColumnTitle: false})
      await awsUploadToS3(`dashboard_ranking_history/${process.env.RATECITY_REDSHIFT_DATABASE}/${filename}`, csv, 'redshift-2node')

      let command = `delete from dashboard_ranking_history where collectiondate = '${this.collectionDate}' and slug = '${this.currentLeaderboard.slug}'`
      await redshiftQuery(command)
      command = `copy ${table} from 's3://redshift-2node/dashboard_ranking_history/${process.env.RATECITY_REDSHIFT_DATABASE}/${filename}' credentials 'aws_access_key_id=${process.env.S3_KEY};aws_secret_access_key=${process.env.S3_SECRET}' NULL AS 'null' EMPTYASNULL CSV ACCEPTINVCHARS TRUNCATECOLUMNS COMPUPDATE OFF`
      await redshiftQuery(command)
    }
  }

  async rollingDelete (days=180) {
    let enddate = moment(this.collectionDate).subtract(days, 'days').format('YYYY-MM-DD')
    let command = `delete from dashboard_ranking_history where collectiondate < '${enddate}'`
    await redshiftQuery(command)
  }
}

async function runDashboard () {
  let current = moment('2019-04-26')
  let endDate = '2019-10-23'
  let dashboard = new leaderDashBoard()
  // await dashboard.process({collectionDate: endDate})
  // dashboard.rollingDelete()
  while (current.isSameOrBefore(endDate)) {
  //  await dashboard.process({collectionDate: current.format('YYYY-MM-DD')})
    await dashboard.process({collectionDate: current.format('YYYY-MM-DD'), leaderboardSlugs: ['best-all-lvr-20-flex', 'best-20-lvr-20-flex', 'best-all-lvr-30-flex', 'best-20-lvr-30-flex']})
    current = current.add(1, 'day')
  }
  console.log('ran dashboard')
  return 0
}

// runDashboard()

module.exports = leaderDashBoard
