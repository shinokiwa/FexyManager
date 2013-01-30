var app = {
  reload: function() {
    return location.reload();
  }
};

$(document).ready (function () {
	$('#Message').bind ({
		'click': function (){$(this).slideUp('fast');},
		'message':function (e, msg){
			if (msg != null) {
				$(this).text(msg);
				$(this).slideDown('fast');
			}
		}
	});
	
	$('form').bind ({
		'submit': function (e) {
			e.preventDefault();
		    return $.ajax({
		    	type: e.target.method,
		        url: e.target.action,
		        dataType: "json",
		        cache: false,
		        data: $(e.target).serialize(),
		        success: function(res, textStatus) {
		            $('#Message').trigger('message', [res.message]);
		            if (res.auth == false) {
		              login.display();
		              return false;
		            }
		            $(e.target).trigger ('response', arguments);
		        },
		        error: function() {}
		      });
		}
	});
});