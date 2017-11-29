var keystone = require('keystone')
var Types = keystone.Field.Types

var Tile = new keystone.List('Tile', {track: true}).add({
	name: {type: Types.Text, initial: true, unique: true},
	icon: {type: Types.Url, initial: true},
})

Tile.relationship({path: 'brokers', ref: 'Broker', refPath: 'tiles'});
Tile.defaultColumns = 'name, icon'
Tile.register()


