const fetch = require('node-fetch')
const keystone = require('keystone')

exports.screen = (req, res) => {
  var view = new keystone.View(req, res)
  var locals = res.locals
  locals.section = 'home'
  view.render('cloudflare')
}

exports.flushByCacheTag = async (req, res) => {
  const { tags } = req.body
  const response = await flush(tags.split(','))
  const data = await response.json()
  return res.status(200).json({ data })
}

async function flush (tags) {
  return fetch(`https://api.cloudflare.com/client/v4/zones/858ee85c58359c3c76b3f9c5ccccf724/purge_cache`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Email': 'tech@ratecity.com.au',
      'X-Auth-Key': '680c96a3020445d13c2828ca2a8f286bf5960',
    },
    body: JSON.stringify({ tags }),
  })
}
