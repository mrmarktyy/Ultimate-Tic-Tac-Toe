var keystone = require('keystone');

module.exports = process.env.S3_SECRET ?
  new keystone.Storage({
    adapter: require('keystone-storage-adapter-s3'),
    s3: {
      path: 'keystone',
      headers: {
        'x-amz-acl': 'public-read',
      }
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
