App.Models.Contact = Backbone.Model.extend({
	validate: function(attrs) {
		if ( ! attrs.name ) {
			return 'A name are required.';
		}

		if ( ! attrs.email ) {
			return 'Please enter a valid email address.';
		}

		if( isNaN(attrs.phone) == true ){
			return 'Please enter a valid number';
		}
		if ( ! attrs.skypeid ) {
			return "Please enter a valid skype id";
		}
	},
	idAttribute : "_id",
	urlRoot: "/contacts",
});

App.Models.Login = Backbone.Model.extend({
	urlRoot: '/login',
	email: '',
	password: ''
});