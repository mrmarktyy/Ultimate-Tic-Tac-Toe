// node uploads/activeRedirects.js
// put proxy redirect.map in tmp directory in project, and get newRedirect.map
require('dotenv').config()
var fs = require('fs')

var keystoneShell = require('../utils/keystoneShell')
var mongoosePromise = require('../utils/mongoosePromise')

const productService = require('../services/productService')

const Redirect = keystoneShell.list('Redirect')

module.exports = async function () {
  let connection = await mongoosePromise.connect()
  try {
    let redirects = await Redirect.model.find({}).lean().exec()
    redirects = redirects.map((redirect) => redirect.from)
    await verticalFilter(redirects)

    connection.close()
  } catch (error) {
    console.log(error)
    return error
  }
}()

async function verticalFilter (redirects) {
  let path = __dirname.split('/')
  path.pop()
  path = path.concat('tmp')
  let filenameIn = (path.concat('redirect.map')).join('/')
  let filenameOut = (path.concat('newRedirect.map')).join('/')
  var redirectFile = await readFile(filenameIn)
  const filecountStart = redirectFile.length

  let urls = []
  const verticalProducts = await productService({isDiscontinued: false})
  for (let vertical in verticalProducts) {
    let verticalURL = vertical.replace(/\s+/g, '-').toLowerCase()
    let products = verticalProducts[vertical]
    for (let i=0; i < products.length; i++) {
      let productSlug = '/' + verticalURL + '/' + products[i].company.slug.replace(/\s+/g, '-').toLowerCase() + '/' + products[i].slug.replace(/\s+/g, '-').toLowerCase()
      if (redirects.includes(productSlug)) {
        urls.push(productSlug)
        Redirect.model.remove({from: productSlug}).exec()
      }
      redirectFile = redirectFile.filter((record) => {
        let from = record.split(' ')[0]
        if (from === productSlug) {
          console.log(productSlug)
        }
        return from !== productSlug
      })
    }
  }
  let offset = filecountStart - redirectFile.length
  console.log('File count ' + filecountStart + ' after ' + redirectFile.length + ' difference ' + offset)

  redirectFile = redirectFile.join('\n')
  fs.writeFile(filenameOut, redirectFile, function (err) {
    err ? console.log(err) : console.log('File was saved')
  })
  console.log('Mongo redirect count ' + urls.length)
  return 0
}

async function readFile (filename) {
  return new Promise(function (resolve, reject) {
    fs.readFile(filename, 'utf8', function (err, data)
    {
      if (err)
        {
          console.log('in error')
          reject()
        }
      var lines = data.split('\n')
      resolve(lines)
    })
  })
}
