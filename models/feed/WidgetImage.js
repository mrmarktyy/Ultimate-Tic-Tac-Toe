var keystone = require('keystone');
var Types = keystone.Field.Types;
var blazeCallback = require('../helpers/blazeCallback.js')
var { imageStorage, addImage } = require('../helpers/fileStorage')

var WidgetImage = new keystone.List('WidgetImage');

WidgetImage.add({
  name: {type: Types.Text, initial: true, required: true},
  distributor: {type: Types.Text, initial: true, required: true},
  placement: {type: Types.Text, initial: true, required: true},
  url: {type: Types.Text, initial: true, required: true},
});

addImage(WidgetImage, 'image')
WidgetImage.schema.post('save', blazeCallback('feed_content'))
WidgetImage.defaultColumns = 'name, distributor, placement, url, image';

WidgetImage.register();
