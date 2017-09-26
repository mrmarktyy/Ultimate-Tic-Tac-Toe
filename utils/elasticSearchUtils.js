const client = require('./elasticsearch')

exports.client = client

exports.checkIndexExists = async function (indexName) {
  let indexExists = await client.indices.exists({index: indexName})

  return indexExists
}

exports.createIndex = async function (indexName, mappings, settings) {
  await client.indices.create({
    index: indexName,
    body: {
      mappings,
      settings,
    },
  })

  return await client.indices.refresh({index: indexName})
}

exports.importData = async function (indexName, typeName, data, idField, batchSize = 100) {
  let requestBody = []
  let insertRequests = []

  for (let i = 0; i < data.length;) {
    if (idField && data[i][idField]) {
      requestBody.push({
        index: {
          _id: data[i][idField],
        },
      })
    } else {
      requestBody.push({index: {}})
    }
    requestBody.push(data[i])
    i++

    if (i % batchSize === 0) {
      insertRequests.push(client.bulk({
        index: indexName,
        type: typeName,
        requestTimeout: 500000,
        body: requestBody,
      }))
      requestBody = []
    }
  }
  if (requestBody.length > 0) {
    insertRequests.push(client.bulk({
      index: indexName,
      type: typeName,
      requestTimeout: 500000,
      body: requestBody,
    }))
  }

  await Promise.all(insertRequests)
  await client.indices.refresh({index: indexName})
}
