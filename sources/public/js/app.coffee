app = 
	get: (url, next)->
		$.ajax {
			type: "GET",
			url: url,
			dataType: "json",
			success: (res)->
				app.baseAction res, next
			error: ()->
		}
	
	post: (form, next) ->
		$.ajax {
			type: "POST",
			url: form.attr('action'),
			dataType: "json",
			cache: false
			data: form.serialize()
			success: (res, textStatus )->
				app.baseAction res, next
			error: ()->
		}

	baseAction: (res, next)->
		if res.auth? && !res.auth
			login.display()
			return false
		if res.info?
			$('.information').remove()
			if (res.info.length > 0)
				item = $('<div>').addClass('information text-info').append(res.info)
				$(c).append(item);
		if res.action? && app[res.action]?
			app[res.action]()
		else
			next?(res)

	reload: ->
		location.reload()
