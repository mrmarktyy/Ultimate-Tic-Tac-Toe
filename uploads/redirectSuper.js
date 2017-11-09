// node --harmony_async_await uploads/redirectSuper.js
require('dotenv').config()
var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')

const FundGroup = keystoneShell.list('FundGroup')
const Superannuation = keystoneShell.list('Superannuation')
const Redirect = keystoneShell.list('Redirect')

module.exports = async function () {
  let connection = await mongoosePromise.connect()
  try {
    let superText = 'Super Company Redirect'
    let pensionText = 'Pension Company Redirect'
    let fundGroups = await FundGroup.model.find({company: {$ne: null}}).populate('company').lean().exec()
    await Redirect.model.remove({ $or: [{notes: superText}, {notes: pensionText}] })

    let list = []
    for(let i = 0; i < fundGroups.length; i++) {
      let item = fundGroups[i]
      let isSuper = !!(await Superannuation.model.findOne({ fundgroup: item._id, superannuation: true }, {_id: 1})) // eslint-disable-line babel/no-await-in-loop
      let isPension = !!(await Superannuation.model.findOne({ fundgroup: item._id, pension: true }, {_id: 1})) // eslint-disable-line babel/no-await-in-loop

      if (isSuper) {
        let obj = {}
        obj.status = '302'
        obj.notes = superText
        obj.from = `/superannuation/${item.slug}`
        obj.to =  `/superannuation/${item.company.slug}`
        list.push(obj)
      }
      if (isPension) {
        let obj1 = {}
        obj1.status = '302'
        obj1.notes = pensionText
        obj1.from = `/pension/${item.slug}`
        obj1.to =  `/pension/${item.company.slug}`
        list.push(obj1)
      }
    }
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
