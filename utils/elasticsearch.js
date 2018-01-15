require('dotenv').config()
var elasticsearch = require('elasticsearch')
var AgentKeepAlive = require('agentkeepalive')

var log = {
  type: 'stdio',
  level: ['error'],
}

var client = new elasticsearch.Client({
  host: process.env.ELASTICSEARCH_URL,
  log: log,
  apiVersion: '2.4',
  createNodeAgent (connection, config) {
    return new AgentKeepAlive(connection.makeAgentConfig(config))
  },
})

module.exports = client
