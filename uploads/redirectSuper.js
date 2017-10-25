// node --harmony_async_await uploads/redirectSuper.js
require('dotenv').config()
var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')

const FundGroup = keystoneShell.list('FundGroup')
const Redirect = keystoneShell.list('Redirect')

module.exports = async function () {
  let connection = await mongoosePromise.connect()
  try {
    let superText = 'Super Company Redirect'
    let fundGroups = await FundGroup.model.find({company: {$ne: null}}).populate('company').lean().exec()
    await Redirect.model.remove({notes: superText})

    let list = []
    fundGroups.forEach((item) => {
      let obj = {}
      obj.status = '302'
      obj.notes = superText
      obj.from = `/superannuation/${item.slug}`
      obj.to =  `/superannuation/${item.company.slug}`
      list.push(obj)
    })
    await Redirect.model.insertMany(list, (error) => {
      if (error) {
        console.log(error)
        return error
      }
    })
    console.log(list)
    console.log(`${list.length} fund group(s) affected`)
    connection.close()
  } catch (error) {
    console.log(error)
    return error
  }
}()
