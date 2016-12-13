var keystone = require('keystone');
var Types = keystone.Field.Types;

imageStorage = function (namespace) {
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
          path: keystone.expandPath('./public/uploads'),
          publicPath: '/public/uploads',
        }
      })
    }
  }
}

/* Adds an image named "namespace" to the model, as well as an attribute
  namespace_url to the model that contains the publicly available url of the image.
  This allows images to work seamlessly in development mode if the cloudinary
  service has not been configured */
addImage = function (model, namespace, options = {initial: true, required: true}) {
  model.schema.virtual(`${namespace}_url`).get(function () {
    if (process.env.CLOUDINARY_URL) {
      return this[namespace].url
    } else {
      if (!this.image.filename) {
        return null
      }
      if (process.env.HOST_DOMAIN) {
        return `http://${HOST_DOMAIN}/uploads/${this.image.filename}`
      } else {
        return `http://localhost:4000/uploads/${this.image.filename}`
      }
    }
  });

  model.add({
    [namespace]: Object.assign(imageStorage(`${model.modelName}-${namespace}`), options),
  });

}

module.exports = { imageStorage,  addImage }
