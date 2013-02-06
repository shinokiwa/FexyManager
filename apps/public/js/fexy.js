$.fn.open = function () {
	$('.view:visible').close();
	$(this).trigger('open').show();
}
$.fn.close = function () {
	$(this).trigger('close').hide();
}

$(document).ready(function() {

	$(window).bind({
		'hashchange': function (e) {
			$('.view:visible').hide();
			var hash = location.hash.split('/');
			$(this).data('view', (hash[0])?hash[0]:'#Index');
			$(this).data('folder', (hash[1] !== undefined)?hash[1]:null);
			$(this).data('file', (hash[2] !== undefined)?hash[2]:null);
			$($(this).data('view')).open();
		}
	});

	$.ajaxSetup({
		dataType: 'json',
		type: 'post',
		success: function(res, textStatus, settings) {
			console.log (res);
			if (res.reload == true) {
				location.reload();
				return false;
			}
			if (res.message) $('#Message').data('msg', res.message).open();
			if (res.auth == false) {
				$('#Login').open();
				return false;
			}
			settings.complete(res);
		}
		
	});
	
	$('#Navi').bind ({
		'open, close': function (e) {
			$('body').css('padding-top', $('header').height() + 20 + 'px');
		}
	});
	
	$('#Message').bind({
		'open' : function(e) {
			$('#Message span').text($(this).data('msg'));
			$('#Message').slideDown('fast');
		}
	}).find('#Message .close').click(function() {
		$('#Message').slideUp('fast');
	});
	
	$('#Login').bind({
		'show' : function() {
			$('#Navi:visible').close();
			$('#username, #password').val('');
			$('#username').focus();
		}
	}).find('form').submit(function(e){
		e.preventDefault();
		$.ajax({url:'/user/login.json', data:$(this).serialize()});
	});

	$('#Search').bind({
		'submit' : function(e) {
			e.preventDefault();
			$.ajax({url:'/folder/search.json'}).complete(function(res){console.log(arguments);$('#Index').data('list', res.data[0]).change().open();});
		}
	});

	
	$('#Index').bind({
		'open' : function(e) {
			if ($(this).find('.media-list:visible').length == 0) {
				$('#Search').submit();
				return;
			}
			$('#Navi:hidden').open();
		},
		'change' : function() {
			$('#Index .media:visible').remove();
			console.log($('#Index').data());
			var data = $(this).data('list');
			for (var i=0; i<data.length;i++) {
				var media = $('#Index .media:first-child').clone();
				media.find('h4').text(data[i].name);
				$('#Index .media-list').append(media);
				media.show();
			}
		}
	}).on('click', ".media-list .media", function(e) {
		e.preventDefault();
		location.hash='Detail/'+$(this).find('h4').text();
	});

	$('#Detail').bind({
		'open' : function(e) {
			if (location.hash.length > 1) {
				$(this).find('h3').text($(this).data('name'));
				$('.view:visible').trigger('close');
				$(this).show();
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
	
	$('#Wrapper').trigger('hashchange');
});