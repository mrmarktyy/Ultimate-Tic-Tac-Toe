var keystone = require('keystone');
var Types = keystone.Field.Types;

module.exports = function (namespace) {
  if (process.env.CLOUDINARY_URL) {
    return {
      type: Types.CloudinaryImage,
      folder: namespace,
      autoCleanup : true
    }
  } else {
    return  {
      type: Types.File,
      storage:  new keystone.Storage({
        adapter: keystone.Storage.Adapters.FS,
        fs: {
          path: keystone.expandPath('./uploads'),
          publicPath: '/public/uploads',
        }
      })
    }
  }
}
