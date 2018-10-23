var keystone = require('keystone')
var Types = keystone.Field.Types

var Tile = new keystone.List('Tile', {track: true}).add({
	name: {type: Types.Text, initial: true, unique: true, require: true},
	displayName: {type: Types.Boolean, initial: true},
	icon: {type: Types.Url, initial: true},
	displayIcon: {type: Types.Boolean, initial: true},
	description: {type: Types.Code, initial: true, height: 250, language: 'html'},
	displayDescription: {type: Types.Boolean, initial: true},
})

Tile.relationship({path: 'brokers', ref: 'Broker', refPath: 'tiles'});
Tile.defaultColumns = 'name, icon'
Tile.register()
