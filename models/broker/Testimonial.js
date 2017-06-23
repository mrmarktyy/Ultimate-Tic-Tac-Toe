var keystone = require('keystone')
var Types = keystone.Field.Types

var Testimonial = new keystone.List('Testimonial').add({
	name: {type: Types.Text, initial: true, unique: true},
	message: {type: Types.Text, initial: true},
	href: {type: Types.Url, initial: true},
	author: {type: Types.Text, initial: true},
	authorInfo: {type: Types.Text, initial: true},
})

Testimonial.relationship({path: 'brokers', ref: 'Broker', refPath: 'testimonials'});
Testimonial.defaultColumns = 'name, message, href, author, authorInfo'
Testimonial.register()


