// node ./services/realTimeRating/leaderDashBoard.js
// coefficents have no date!
const redshiftQuery = require('../../utils/ratecityRedshiftQuery')
const awsUploadToS3 = require('../../utils/awsUploadToS3')
const json2csv = require('json2csv')
var keystoneShell = require('../../utils/keystoneShell')
var mongoosePromise = require('../../utils/mongoosePromise')
var Leaderboard = keystoneShell.list('Leaderboard')
const moment = require('moment')

class leaderDashBoard {
	constructor () {
    this.collectionDate = ''
    this.homeLoanRatings = []
    this.currentLeaderboard = ''
    this.previousLeaderDashBoard = ''
  }

  async process (collectionDate = moment().format('YYYY-MM-DD')) {
    this.collectionDate = collectionDate
    let connection = await mongoosePromise.connect()
    try {
      // let leaderboards = await Leaderboard.model.find({ultimateFilterCriteria: {$ne: null}, $where: 'this.ultimateFilterCriteria.length > 1'}).lean().exec()
      // let leaderboards = await Leaderboard.model.find({slug: 'best-owner-occupied-big-deposit'}).lean().exec()
      // let leaderboards = await Leaderboard.model.find({slug: 'best'}).lean().exec()
      let leaderboards = await Leaderboard.model.find({flexibilityWeighting: 0.3}).lean().exec()
      for (let i=0; leaderboards.length > i; i++) {
        let dashboardRankings = []
        this.currentLeaderboard = leaderboards[i]
        this.homeLoanRatings = await this.getHomeLoanRatings()
        dashboardRankings = this.leaderRank(this.currentLeaderboard.ultimateFilterCriteria.includes(`homeloantype = 'FIXED'`))
        dashboardRankings = await this.addPreviousPosition(dashboardRankings)
        if (dashboardRankings.length) {
          let filename = `dashboard_${this.collectionDate}_${this.currentLeaderboard.slug}`
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
    console.log(this.currentLeaderboard.slug)
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
        userloanamount: rating.userloanamount,
        averagemonthlycost: parseFloat(averagemonthlycost),
        costrating: parseFloat(costrating),
        flexibilityscore: parseFloat(rating.flexibilityscore),
        flexibilityrating: parseFloat(rating.flexibiltyrating),
        cost: Math.round(cost * 100)/100,
        flexibility: Math.round(flexibility * 100)/100,
        overallrating: Math.round(overallRating * 100)/100,
        variationposition: 0,
        variationsince: 0,
        productposition: 0,
        productsince: 0
      }
      records.push(obj)
    })

    let productUUIDs = []
    records = records.sort((a, b) => a.overallrating == b.overallrating ? 0 : +(b.overallrating > a.overallrating) || -1 )
    records = records.map((record, index) => {
      let productposition = 0
      if (!productUUIDs.includes(record.uuid)) {
        productUUIDs.push(record.uuid)
        productposition = productUUIDs.length
      }
      return Object.assign(record, {variationposition: index + 1, productposition: productposition})
    })
    return records
  }

  async addPreviousPosition (records) {
    let previousDate = moment(this.collectionDate).subtract(1, 'day').format('YYYY-MM-DD')
    let sql = `
      select * from dashboard_ranking_history
      where collectionDate = '${previousDate}'
      and slug = '${this.currentLeaderboard.slug}'
      order by productposition desc
    `
    let previousDash = await redshiftQuery(sql)
    if (previousDash.length) {
      records = records.map((record) => {
        let varationdays = 0
        let previous = previousDash.find((prev) => {
          return (prev.slug === record.slug && prev.variationuuid === record.variationuuid && prev.variationposition === record.variationposition)
        })
        if (previous) {
          varationdays = previous.variationsince + 1
        }
        let productdays = 0
        if (record.productposition) {
          previous = previousDash.find((prev) => {
            return (prev.slug === record.slug && prev.uuid === record.uuid && prev.productposition === record.productposition)
          })
          if (previous) {
            productdays = previous.productsince + 1
          }
        }
        return Object.assign(record, {variationsince: varationdays, productsince: productdays})
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
}

async function runDashboard () {
  let current = moment('2018-09-28')
  // current = moment('2018-11-26')
  // let endDate = '2018-09-28'
  let endDate = '2019-02-28'
  let dashboard = new leaderDashBoard()
  while (current.isSameOrBefore(endDate)) {
    await dashboard.process(current.format('YYYY-MM-DD'))
    current = current.add(1, 'day')
  }
  console.log('ran dashboard')
}

runDashboard()
