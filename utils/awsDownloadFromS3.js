const fs = require('fs')
const AWS = require('aws-sdk')
const logger = require('../utils/logger')

AWS.config.update({accessKeyId: process.env.S3_KEY, secretAccessKey: process.env.S3_SECRET})

module.exports = function awsDownloadFromS3(bucket, filename, path) {
	const s3 = new AWS.S3()
	return new Promise((resolve, reject) => {
		const params = {
			Bucket: bucket,
			Key: filename,
		}
		const file = fs.createWriteStream(path);
		s3.getObject(params)
			.createReadStream()
			.on('error', reject)
			.on('end', resolve)
			.pipe(file)
	})
}
