$(document).ready(function() {
	$('#NavMenu a').click(function(e) {
		e.preventDefault();
		$('#Action').trigger('send', [ e.target.href ]);
	});

	$('#Message > .close').click(function() {
		$('#Message').slideUp('fast');
	});
	$('#Message').bind({
		'message' : function(e, msg) {
			if (msg != null) {
				$('#Message > button').after(msg);
				$(this).slideDown('fast');
			}
		}
	});

	$('form').bind({
		'submit' : function(e) {
			e.preventDefault();
			$.ajax({
				type : e.target.method,
				url : e.target.action,
				dataType : "json",
				cache : false,
				data : $(e.target).serialize(),
				success : function(res, textStatus) {
					if (res.reload == true) {
						location.reload();
						return false;
					}
					$('#Message').trigger('message', [ res.message ]);
					if (res.auth == false) {
						$('#Login').trigger('display');
						return false;
					}
					$(e.target).trigger('response', [ res ]);
				},
				error : function() {
				}
			});
		}
	});

	$('#Action').bind({
		'send' : function(e, url) {
			$('#Action').attr('action', url).submit();
		},
		'response' : function() {
		}
	});

	$('#Login').bind({
		'display' : function() {
			$('.view').trigger('close');
			$('#username, #password').val('');
			$('#Login').show();
			$('#username').focus();
		}
	});

	$('#Search').bind({
		'response' : function(e, res) {
			$('#Index').trigger('clear');
			$('#Index').show();
			for ( var i = 0; i < res.data.length; i++) {
				$('#Index').trigger('add-media', [ res.data[i] ]);
			}
		}
	});

	$('#Index').bind({
		'display' : function() {
			$('#Search').submit();
		},
		'close' : function() {
			$('#Index').hide();
		},
		'clear' : function() {
			$('#Index .media:visible').remove();
		},
		'add-media' : function(e, data) {
			var media = $('#Index .media:first-child').clone();
			media.data('src', data);
			media.find('h4').text(data.name);
			$('#Index .media-list').append(media);
			media.show();
		}
	});

	$('#Index .media-list').on('click', ".media", function(e) {
		e.preventDefault();
		$('#Detail').trigger('display', [ $(this).data('src') ]);
	});

	$('#Detail').bind({
		'display' : function(e, data) {
			if (data) {
				$('#Detail').data('src', data);
				var modal = $('#Detail .modal');
				modal.find('h3').text(data.name);
				modal.modal('show');
			}
		},
		'close' : function() {
			$('#Detail .modal').modal('hide');
		}
	});
	$('#Detail .closeDetail').click(function(e) {
		e.preventDefault();
		$('#Detail').trigger('close');
	});

	$('#Detail #BtnFull').click(function(e) {
		e.preventDefault();
		$('#Full').trigger('display', [$('#Detail').data('src')]);
	});

	$('#Full').bind({
		'display' : function(e, data) {
			if (data) {
				var $div = $('<div class="item">');
				var $item = $('<img src="/folder/view/'+data.name+'/'+data.files[0].name+'">');
				$div.append ($item);
				$('#Full .carousel-inner').append($div.clone());
				$div.addClass('active');
				$('#Full .carousel-inner').append($div);
				$('#Full').show();
			}
		},
		'close' : function() {
			$('#Full').hide();
			$('#Full .item').remove();
		}
	});
	
	$('.view').trigger('display');
});