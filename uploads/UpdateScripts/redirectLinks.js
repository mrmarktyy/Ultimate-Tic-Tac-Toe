require('dotenv').config()

const keystoneShell = require('../../utils/keystoneShell')
const mongoosePromise = require('../../utils/mongoosePromise')
let redirectLinks = require('../../data/redirect')
const Redirect = keystoneShell.list('Redirect')
const keystoneUpdate = require('../../utils/helperFunctions').keystoneUpdate

const importRedirectLinks = async () => {
  let connection = await mongoosePromise.connect()
  for (const redirect of redirectLinks) {
    let redirectData = await Redirect.model.findOne({'from': redirect.from}).exec()
    if (!redirectData) {
      redirectData = new Redirect.model()
      redirectData.set({status: '301', ...redirect})
      await keystoneUpdate(redirectData)
    }
  }
  connection.close()
  process.exit()
}

importRedirectLinks()
