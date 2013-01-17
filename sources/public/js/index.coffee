index=
	view: {}
	skelton: {}
	cnt: 0
	folders: []
	cntFolders: 0
	scrollTop: 0

	init: ->
		index.view = $('#Index')
		index.skelton = $('#Index > #skelton')
		$(window).scroll index.getOne
		$(window).resize index.getOne

	display: ->
		location.hash = ''
		index.view.show()
		$(window).scrollTop index.scrollTop
		if index.cntFolders is 0
			app.get "/folder/search.json", (res)->
				index.cntFolders = res.count
				index.skelton.fadeIn () -> index.getOne()

	hidden: ->
		index.view.hide()

	getOne_process: false
	getOne: ()->
		if (index.view.css 'display') isnt 'block' then return
		if index.getOne_process then return

		contentBottom = index.skelton.offset().top
		scrollBottom = $(window).height() + $(window).scrollTop() + $('footer').height() + 10
		if (contentBottom <= scrollBottom)
			index.getOne_process = true
			app.get "/folder/getOne.json?f=#{index.cnt}", (res)->
				index.cnt++
				index.getOne_process = false
				folder = res.folder
				if folder.name?
					index.folders[folder.name] = folder
					$item = index.skelton.clone()
					$item.removeAttr('id').hide()
					$item.append $('<div />').addClass('thumbnail').css('background-image', 'url("/img/file.png")')
					hash = "##{folder.name}"
					$item.click index.click hash
					$item.append("<h4>#{folder.name}</h4>")
					$item.ready ->
						$item.fadeIn()
						index.getOne()
					index.skelton.before $item
	
	click: (hash) ->
		return (e) ->
			e.preventDefault()
			index.scrollTop = $(window).scrollTop()
			location.hash = hash
			view.show detail

view.list.push index