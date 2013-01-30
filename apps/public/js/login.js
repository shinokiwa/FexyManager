var login = {
	init: function() {
	},
	display: function() {
		$('#LoginForm input[type="text"]').val('');
		return $('#LoginForm').show();
	},
	hidden: function() {
		return $('#LoginForm').hide();
	}
};

view.list.push(login);
