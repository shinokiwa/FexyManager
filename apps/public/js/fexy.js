$.fn.open = function() {
	return $(this).trigger('open');
}
$.fn.close = function() {
	return $(this).trigger('close');
}

$(document).ready(function() {
	$.ajaxSetup({
		dataType : 'json',
		type : 'post',
		success : function(res, textStatus, xhr) {
			if (res.reload == true) {
				location.reload();
			}
			if (res.message)
				$('#Message').data('msg', res.message).open();
		},
		error : function(res, textStatus, textError) {
			if (res.status == 401) {
				$('#Login').open();
			}
		}
	});
	$(window).bind({
		'hashchange' : function(e) {
			$('.view:visible').hide();
			var hash = location.hash.split('/');
			$(this).data('view', (hash[0]) ? hash[0] : '#Index');
			$(this).data('folder', (hash[1] !== undefined) ? hash[1] : null);
			$(this).data('file', (hash[2] !== undefined) ? hash[2] : null);
			$($(this).data('view')).open();
		}
	});

	$('#Navi').bind({
		'open' : function(e) {
			$(this).show(0, function() {
				$('body').css('padding-top', $('header').height() + 20 + 'px');

			});
		},
		'close' : function(e) {
			$(this).hide(0, function() {
				$('body').css('padding-top', $('header').height() + 20 + 'px');
			});
		}
	});

	$('#Message').bind({
		'open' : function(e) {
			$('#Message span').text($(this).data('msg'));
			$('#Message').slideDown('fast');
		}
	}).children('#Message .close').click(function() {
		$('#Message').slideUp('fast');
	});

	$('#Login').bind({
		'open' : function() {
			$('.view:visible, #Navi:visible').close();
			$('#username, #password').val('');
			$(this).show(0, function() {
				$('#username').focus()
			});
		},
		'close' : function() {
			$(this).hide();
		}
	}).children('form').submit(function(e) {
		e.preventDefault();
		$.ajax({
			url : '/user/login.json',
			data : $(this).serialize()
		});
	});

	$('#Search').bind({
		'submit' : function(e) {
			e.preventDefault();
			$.ajax({
				url : '/folder/search.json'
			}).done(function(res) {
				$('#Index').data('list', res.data).change();
				$('#Index:hidden, #Navi:hidden').open();
			});
		}
	});

	$('#Index').bind({
		'open' : function(e) {
			$(this).show(0, function() {
				if ($(this).children('.media:visible').size() == 0) {
					$('#Search').submit();
				} else {
					$('#Navi:hidden').open();
				}
			});
		},
		'change' : function() {
			$('#Index .media:visible').remove();
			var data = $(this).data('list') || [];
			for ( var i = 0; i < data.length; i++) {
				var $media = $('#Index .media:first-child').clone();
				var $mediaData = $media.contents().children('.mediaData');
				$media.data(data[i]);
				$mediaData.filter('[data-src=name]').text(data[i].name);
				$('#Index .media-list').append($media);
				$media.show();
			}
		},
		'close' : function() {
			$(this).hide();
		}
	}).on('click', ".media-list .media", function(e) {
		e.preventDefault();
		location.hash = 'Detail/' + $(this).data('name');
	});

	$('#Detail').bind({
		'open' : function(e) {
			$('#Navi:hidden').open();
			$.ajax('/folder/get.json', {
				data : {
					'name' : $(window).data('folder')
				}
			}).done(function(res) {
				$('#Detail').data(res.data);
				$('#Detail').change();
				$('#Detail').show();
			}).fail(function(res) {
				location.hash = '';
			});
		},
		'close' : function() {
			$(this).hide();
		},
		'change' : function (e) {
			e.preventDefault();
			var $mediaData = $('#Detail .mediaData');
			$mediaData.filter('[data-src=name]').text($('#Detail').data('name'));
			var $fileList = $('#Detail .files .file-list');
			$fileList.children(':gt(0)').remove();
			var fileData =$('#Detail').data('files'); 
			for (var i=0;i<fileData.length;i++) {
				var $file = $fileList.children('.file-list *:first-child').clone();
				var $fileData = $file.contents().filter('.fileData');
				$fileData.filter('[data-src=name]').text(fileData[i].name);
				$fileList.append($file);
				$file.show();
			}
		}
	}).on('click', '.fullView', function(e) {
		e.preventDefault();
		location.hash = 'Full/' + $('#Detail').data('name') + '/' + $('#Detail').data('files')[0].name;
	}).on('click', '.sync', function(e) {
		e.preventDefault();
		$.ajax('/folder/sync.json', {
			data : {
				'name' : $(window).data('folder')
			}
		}).done(function(res) {
			$('#Detail').data(res.data);
			$('#Detail').change();
		}).fail(function(res) {
			location.hash = '';
		});
	});

	$('#Full').bind({
		'open' : function(e, data) {
			$('#Navi:visible').close();
			$(this).show(0, function () {
				$('#Full').html('<a href="#"><img src="/folder/view/'+$(window).data('folder')+'/'+$(window).data('file')+'" /></a>');
			});
		},
		'close' : function() {
			$(this).hide();
		}
	});

	$(window).trigger('hashchange');
});
