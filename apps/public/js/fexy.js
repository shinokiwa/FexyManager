$.fn.open = function() {
	return $(this).trigger('open');
};
$.fn.close = function() {
	return $(this).trigger('close');
};

var m = {
	views : {
		_v : {},
		get : function(i) {
			return (this._v[i] !== undefined) ? this._v[i] : void 0;
		},
		build : function() {
			var hash = location.hash.split('/');
			this._v.view = (hash[0]) ? hash[0] : '#Index';
			this._v.folder = (hash[1] !== undefined) ? hash[1] : null;
			this._v.file = (hash[2] !== undefined) ? hash[2] : null;
			return this;
		}
	},

	details : {
		_data : {},
		_name : '',
		read : function(fn) {
			if (this._data && this._name === m.views.get('folder')) {
				fn(this._data);
			} else {
				this._name = m.views.get('folder');
				$.ajax('/folder/get.json', {
					data : {
						'name' : this._name
					}
				}).done(function(res) {
					m.details._data = res.data;
					fn(m.details._data);
				}).fail(function(res) {
					location.hash = '';
				});
			}
		}

	}
};

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

$(document).ready(function() {
	$(window).bind({
		'hashchange' : function(e) {
			$('.view:visible').hide();
			m.views.build();
			$(m.views.get('view')).open();
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
				$('#username').focus();
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
			$('#Detail').change().show(0, function() {
				$('#Navi:hidden').open();
			});
		},
		'close' : function() {
			$(this).hide();
		},
		'change' : function(e) {
			e.preventDefault();
			m.details.read(function(data) {
				var $mediaData = $('#Detail .mediaData');
				$mediaData.filter('[data-src=name]').text(data.name);
				var $fileList = $('#Detail .files .file-list');
				$fileList.children(':gt(0)').remove();
				for ( var i = 0; i < data.files.length; i++) {
					var $file = $fileList.children('.file-list *:first-child')
						.clone();
					var $fileData = $file.contents().filter('.fileData');
					$fileData.filter('[data-src=name]')
						.text(data.files[i].name);
					$fileList.append($file);
					$file.show();
				}
			});
		}
	}).on('click', '.fullView', function(e) {
		e.preventDefault();
		m.details.read(function(data) {
			console.log (data);
			location.hash = 'Full/' + data.name + '/' + data.files[0].name;
		});
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
			m.details.read(function(data) {
				for (var i=0;i < data.files.length; i++) {
					if (data.files[i].name === m.views.get('file')) {
						break;
					}
				}
				if (data.files[i-1]) {
					$('#Full .controlls .btnPrev').removeClass('disabled').attr('href', '#Full/'+m.views.get('folder') + '/' + data.files[i-1].name);
				} else {
					$('#Full .controlls .btnPrev').addClass('disabled').attr('href', location.hash);
				}
				$('#Full .controlls .btnBack').attr('href', '#Detail/'+ m.views.get('folder'));
				if (data.files[i+1]) {
					$('#Full .controlls .btnNext').removeClass('disabled').attr('href', '#Full/'+m.views.get('folder') + '/' + data.files[i+1].name);
				} else {
					$('#Full .controlls .btnNext').addClass('disabled').attr('href', location.hash);
				}
			});
			$('#Full .contents').html('<a href="#"><img src="/folder/view/'
				+ m.views.get('folder') + '/' + m.views.get('file')
				+ '" /></a>');
			$(this).show(0);
		},
		'close' : function() {
			$(this).hide();
		}
	});

	$(window).trigger('hashchange');
});
