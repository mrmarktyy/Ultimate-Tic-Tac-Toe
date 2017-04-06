const AWS = require('aws-sdk')
const logger = require('../utils/logger')

AWS.config.update({region: process.env.S3_REGION, accessKeyId: process.env.S3_KEY, secretAccessKey: process.env.S3_SECRET})

module.exports = function awsUploadToS3 (filename, content, bucket, acl = 'bucket-owner-full-control') {
  const s3 = new AWS.S3()

  return new Promise((resolve, reject) => {
    let params = {
      Bucket: bucket,
      Key: filename,
      ACL: acl,
      Body: content,
    }
    s3.putObject(params, (error, data) => {
      if (error) {
        logger.error(error.stack)
        reject(error)
      }
      if (data) {
        resolve()
        logger.info(data)
      }
    })
  })
}
