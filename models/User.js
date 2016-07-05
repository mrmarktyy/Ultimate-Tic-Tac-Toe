var keystone = require('keystone');
var Types = keystone.Field.Types;

var User = new keystone.List('User');

User.add({
	name: { type: Types.Name, required: true, index: true },
	email: { type: Types.Email, initial: true, required: true, index: true },
	password: { type: Types.Password, initial: true, required: true },
  something: { type: Types.EditableBoolean, required: false},
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: true },
});

User.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});

User.defaultColumns = 'name, email, isAdmin, something';
User.register();
