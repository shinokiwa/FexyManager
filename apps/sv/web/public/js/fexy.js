$.fn.open = function() {
	return $(this).trigger('open');
};
$.fn.close = function() {
	return $(this).trigger('close');
};

var m = {
	views : (function() {
		var v = {
			view : null,
			folder : null,
			file : null
		};
		var r = function(i) {
			return (v[i] !== undefined) ? v[i] : void 0;
		};
		r.reload = function() {
			var hash = location.hash.split('/');
			v.view = (hash[0]) ? hash[0] : '#Index';
			v.folder = (hash[1] !== undefined) ? hash[1] : null;
			v.file = (hash[2] !== undefined) ? hash[2] : null;
		};
		return r;
	})(),
	hash : function() {
		return '#' + Array.prototype.slice.apply(arguments).join('/');
	},
	folders : (function() {
		var list = [];
		var conditions = null;
		var f = function(fn) {
			if (list.length) {
				fn(false, list);
			} else {
				m.folders.search(conditions, fn);
			}
		};
		f.search = function(c, fn) {
			$.ajax('./folder/search.json', {
				data : c,
			}).done(function(res) {
				list = res.data;
				fn(true, list);
			});
		};

		return f;
	})(),
	scroll : 0,

	details : (function() {
		var data = {};
		var name = '';
		var d = function(fn) {
			if (data && name === m.views('folder')) {
				fn(data);
			} else {
				name = m.views('folder');
				$.ajax('/folder/get.json', {
					data : {
						'name' : name
					}
				}).done(function(res) {
					data = res.data;
					fn(data);
				}).fail(function(res) {
					location.hash = '';
				});
			}

		};
		
		d.sync = function (fn) {
			$.ajax('/folder/sync.json', {
				data : {
					'name' : m.views('folder')
				}
			}).done(function(res) {
				data = res.data;
				fn(data);
			});
		};

		return d;
	})(),
	fulls : {
		now : 0
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
		if (res.err)
			$('#Error').data('msg', res.err).open();
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
			m.views.reload();
			$(m.views('view')).open();
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

	$('#Message, #Error').bind({
		'open' : function(e) {
			$(this).children('span').text($(this).data('msg'));
			$(this).slideDown('fast');
		}
	}).children('#Message .close, #Error .close').click(function() {
		$(this).parent().slideUp('fast');
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
			m.folders.search($(this).serialize(), function() {
				$('#Index').open();
			});
		}
	});

	$('#Index').bind({
		'open' : function(e) {
			m.folders(function(isChange, list) {
				if (isChange) {
					$('#Index .media:gt(0)').remove();
					$(list).each(function(i, v) {
						var $media = $('#Index .media:first-child').clone().data(v);
						var $mediaData = $media.find('.mediaData');
						$mediaData.filter('[data-src=name]').text(v.name);
						if (v.thumbnail_s) {
							$mediaData.filter('[data-src=thumbnail_s]').attr('src', v.thumbnail_s);
						}
						$('#Index .media-list').append($media);
						$media.show();
					});
				}
				$('#Navi:hidden').open();
				$('#Index:hidden').show();
				$(window).scrollTop(m.scroll);
			});
		},
		'close' : function() {
			$(this).hide();
		}
	}).on('click', ".media-list .media", function(e) {
		e.preventDefault();
		m.scroll = $(window).scrollTop();
		location.hash = m.hash('Detail', $(this).data('name'));
	});

	$('#Detail').bind({
		'open' : function(e) {
			m.details(function(data) {
				var $mediaData = $('#Detail .mediaData');
				$mediaData.filter('[data-src=name]').text(data.name);
				var $fileList = $('#Detail .files .file-list');
				$fileList.children(':gt(0)').remove();
				for ( var i = 0; i < data.files.length; i++) {
					var $file = $fileList.children('.file-list *:first-child').clone();
					var $fileData = $file.contents().filter('.fileData');
					$fileData.filter('[data-src=name]').text(data.files[i].name);
					$fileList.append($file);
					$file.show();
				}
				$('#Detail').show();
				$('#Navi:hidden').open();
			});
		},
		'close' : function() {
			$(this).hide();
		}
	}).on('click', '.fullView', function(e) {
		e.preventDefault();
		m.details(function(data) {
			location.hash = m.hash('Full', data.name, data.files[0].name);
		});
	}).on('click', '.sync', function(e) {
		e.preventDefault();
		m.details.sync(function () {
			$('#Detail').open();
		});
	});

	$('#Full').bind({
		'open' : function(e) {
			$('#Navi:visible').close();
			m.details(function(data) {
				$(data.files).each(function(i, v) {
					if (v.name === m.views('file'))
						m.fulls.now = i;
				});
				if (data.files[m.fulls.now - 1]) {
					$('#Full .controlls .btnPrev').removeClass('disabled').attr('href', m.hash('Full', m.views('folder'), data.files[m.fulls.now - 1].name));
				} else {
					$('#Full .controlls .btnPrev').addClass('disabled').attr('href', location.hash);
				}
				$('#Full .controlls .btnBack').attr('href', m.hash('Detail', m.views('folder')));
				if (data.files[m.fulls.now + 1]) {
					$('#Full .controlls .btnNext').removeClass('disabled').attr('href', m.hash('Full', m.views('folder'), data.files[m.fulls.now + 1].name));
				} else {
					$('#Full .controlls .btnNext').addClass('disabled').attr('href', location.hash);
				}
			});
			$('#Full .contents').html('<img src="/folder/view/' + m.views('folder') + '/' + m.views('file') + '" />');
			$(this).show(0);
		},
		'close' : function() {
			$(this).hide();
		}
	});

	$('.json').click(function(e) {
		e.preventDefault();
		$.ajax($(this).attr('href'), {
			type : 'get'
		});
	});

	$(window).trigger('hashchange');
});