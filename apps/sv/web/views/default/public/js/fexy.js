$(document).ready (function(){
	$.ajaxSetup({
		dataType : 'json',
		type : 'post',
		success : function(res, textStatus, xhr) {
			if (res.message)
				Navi.Message('info', res.message);
			if (res.err)
				Navi.Message('error', res.message);
		},
		error : function(res, textStatus, textError) {
			if (res.status == 401) Login();
		}
	});

	var hash = function () {
		return '#' + Array.prototype.slice.apply(arguments).join('/');
	};
	
	var changeView = function (withNavi) {
		Navi(withNavi);
		$('.view:visible').hide();
		$('.alert').alert('close');
	};

	$(window).bind({
		'hashchange' : function (e) {
			var v={},hash = location.hash.split('/');
			v.view = (hash[0]) ? hash[0] : '#List';
			v.folder = (hash[1] !== undefined) ? hash[1] : null;
			v.file = (hash[2] !== undefined) ? hash[2] : null;
			$('.view:visible').hide();
			switch (v.view) {
				case ('#List'):
					List();
					break;
				case ('#Detail'):
					Detail(v.folder);
					break;
				case ('#Full') :
					Full(v.folder, v.file);
					break;
				default:
					Message ('error', 'Hash Error');
			}
		}
	});

	$(document).on('click', '.json', function(e) {
		e.preventDefault();
		$.ajax($(this).attr('href'), {
			type : 'get'
		});
	});
	
	var Navi = (function () {
		var $Navi = $('#Navi');
		var _change = function () {
			$('body').css('padding-top', $('#Navigations').height() + 20 + 'px');
		};
		var r = function (withNavi) {
			if (withNavi) {
				$Navi.show(0, _change);
			} else {
				$Navi.hide(0, _change);
			}
		};
		r.Message = (function () {
			var $Information = $('#Information');
			return function (type, msg) {
				var $info = $Information.find('.message').clone();
				$info.text(msg);
				$Information.append($info);
				$Information.find('.message:first').slideUp('slow', function () {
					$(this).remove();
				});
			};
		})();
		
		return r;
	})();

	var Login = (function () {
		var $login = $('#Login').contents().remove();
		$login.submit(function(e) {
			e.preventDefault();
			$.ajax({
				url : '/user/login.json',
				data : $(this).serialize()
			}).done(function (res) {
				if (res.auth) {
					$(window).trigger('hashchange');
				} else {
					$('#username, #password').val('');
					$('#username').focus();
				}
			});
		});
		return function() {
			changeView(false);
			$('#Login').html($login.clone(true)).show(0, function() {
				$('#username').focus();
			});
		};
	})();
	
	var List = (function (){
		var _change = true;
		var _scroll = 0;
		var $Folders = $('#Folders');
		var $List = $('#List');
		var $Template = $List.find('.template').remove().removeClass('template');
		var $TagTemplate = $Template.find('.template-tag').remove().removeClass('template-tag');
		var _show = function () {
			changeView(true);
			$('#List').show();
			$(window).scrollTop(_scroll);
		};
		
		var _find = function () {
			$.ajax('./folder/search.json', {
				data : $('#Find').serialize(),
			}).done(function(res) {
				_scroll = 0;
				$Folders.contents().remove();
				$List.find('[data-src=count]').text (res.data.length);
				$(res.data).each(function(i, v) {
					var $folder = $Template.clone();
					$folder.data(v);
					$folder.find('[data-src=name]').text(v.name);
					if (v.thumbnail_s) {
						$folder.find('[data-src=thumbnail_s]').attr('src', v.thumbnail_s);
					}
					if (v.tags && v.tags.length > 0) {
						$(v.tags).each (function (i,v) {
							var $Tag = $TagTemplate.clone();
							$Tag.find('.tag-text').text (v.name);
							$folder.find('[data-src=tags]').append($Tag);
						});
					} else {
						var $Tag = $TagTemplate.clone();
						$Tag.find('.tag-text').text ('New!');
						$folder.find('[data-src=tags]').append($Tag.addClass('tag-new'));
					}
					if (!v.files || v.files.length < 1) {
						var $Tag = $TagTemplate.clone();
						$Tag.find('.tag-text').text ('Empty!');
						$folder.find('[data-src=tags]').append($Tag.addClass('tag-empty'));
					}
					$Folders.append($folder);
					$folder.show();
				});
				_change = false;
				_show();
			});
		};
		$('#Find').submit(_find);
		$Folders.on('click', '.media', function (e){
			e.preventDefault();
			_scroll = $(window).scrollTop();
			location.hash = hash('Detail', $(this).data('name'));
		});
		
		var r = function () {
			if (_change) {
				_find();
			} else {
				_show();
			};
		};
		r.reload = function () {
			_change = true;
		};

		return r;
	})();
	
	var Detail = (function () {
		var $DetailTemplate = $('#Detail').contents().remove();
		var $FileTemplate = $DetailTemplate.find('.template-file').remove().removeClass('template-file');
		var _data = {};

		$DetailTemplate.find('.fullView').click(function(e) {
			e.preventDefault();
			location.hash = hash('Full', _data.name, _data.files[0].name);
		});
		$DetailTemplate.find('.sync').click(function(e) {
			e.preventDefault();
			$.ajax('/folder/sync.json', {
				data : {
					'name' : _data.name
				}
			}).done(function(res) {
				_data = res.data;
				Detail();
			});
		});
		
		$DetailTemplate.find('.remove').click(function(e) {
			e.preventDefault();
			if (window.confirm('Are you sure you want to delete folder?')) {
				$.ajax('/folder/remove.json', {
					data : {
						'name' : _data.name
					}
				}).done(function(res) {
					List.reload();
					location.hash = '#';
				});
			}
		});
		
		var _get = function (name, fn) {
			if (_data && _data.name == name) {
				fn ();
			} else {
				$.ajax('/folder/get.json', {
					data : {
						'name' : name
					}
				}).done(function(res) {
					_data = res.data;
					fn();
				});
			}
		};

		var r = function (folder) {
			_get (folder, function () {
				changeView (true);
				var $Detail = $DetailTemplate.clone(true);

				$Detail.find('[data-src=name]').text(_data.name);
				if (_data.thumbnail_m) {
					$Detail.find('[data-src=thumbnail_m]').attr('src', _data.thumbnail_m);
				}
				
				$(_data.files).each(function (i,v) {
					var $File = $FileTemplate.clone(true);
					$File.find('[data-src=name]').text(v.name);
					$File.show();
					$Detail.find('.file-list').append($File);
				});
				$('#Detail').html($Detail).show();
			});
		};
		
		r.select = function (folder, file, fn) {
			_get (folder, function () {
				var prev = null;
				var next = null;
				for (var i=0; i < _data.files.length; i++) {
					if (_data.files[i].name == file) {
						if (_data.files[i+1]) next = _data.files[i+1];
						var f = _data.files[i];
						f.next = next;
						f.prev = prev;
						fn(f);
						break;
					} else {
						prev = _data.files[i];
					}
				}
			});
		};
		
		return r;
	})();

	var Full = (function () {
		var $Full = $('#Full');
		var $Controll = $Full.find('.controlls');
		var _timer = null;
		var _showControll = function () {
			clearTimeout(_timer);
			$Controll.show();
			_timer = setTimeout (function () {
				$Controll.hide();
			}, 5000);
		};
		
		$Full.mousemove (function () {
			_showControll();
		});
		$Controll.mouseover(function () {
			clearTimeout(_timer);
		});

		$(window).keypress (function (e) {
			if ($('#Full:visible').size() > 0) {
				switch (e.keyCode) {
					case(37):
						location.hash = $Controll.find('.btnPrev').attr('href');
						break;
					case(39):
						location.hash = $Controll.find('.btnNext').attr('href');
						break;
				}
			}
		});
		
		return function (folder, file) {
			Detail.select (folder, file, function (data) {
				changeView (false);
				$(window).scrollTop(0);
				$Full.find('.contents').html('<img src="/folder/view/' + folder + '/' + file + '" />');
				if (data.next == null) {
					$Controll.find('.btnNext').addClass('disabled').attr('href', location.hash);
				} else {
					$Controll.find('.btnNext').removeClass('disabled').attr('href', hash('Full', folder, data.next.name));
				}
				if (data.prev == null) {
					$Controll.find('.btnPrev').addClass('disabled').attr('href', location.hash);
				} else {
					$Controll.find('.btnPrev').removeClass('disabled').attr('href', hash('Full', folder, data.prev.name));
				}
				$Controll.find('.btnBack').attr('href', hash('Detail', folder));
				_showControll();
				$Full.show(0);
			});
		};
	})();
	
	$(window).trigger('hashchange');
});
