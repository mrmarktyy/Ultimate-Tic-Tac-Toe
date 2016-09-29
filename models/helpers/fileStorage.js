var keystone = require('keystone');

module.exports = process.env.S3_SECRET ?
	new keystone.Storage({
		adapter: require('keystone-storage-adapter-s3'),
		s3: {
			path: '/keystone',
			headers: {
				'x-amz-acl': 'public-read',
			}
		},
		schema: {
			bucket: true, // optional; store the bucket the file was uploaded to in your db
			path: true, // optional; store the path of the file in your db
			url: true, // optional; generate & store a public URL
		}
	})
	:
	new keystone.Storage({
		adapter: keystone.Storage.Adapters.FS,
		fs: {
			path: keystone.expandPath('./uploads'),
			publicPath: '/public/uploads',
		}
	})
