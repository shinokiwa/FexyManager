detail =
	view: {}
	field: {}
	footer: {}
	folder: {}

	init: ->
		detail.view = $('#Detail')
		detail.field = $('#Detail > div')
		detail.menu = $('#Detail footer nav.footer-left')

	display: ->
		$(window).scrollTop 0
		detail.view.show()
		folderName = location.hash.substr 1
		if folderName.length > 0
			app.get "/folder/get.json?name=#{folderName}", (res)->
				detail.folder = res.folder
				detail.show(0)()
		else
			view.show(index)

	hidden: ->
		detail.view.hide()
		detail.field.html ("")
	
	show: (file)->
		return (e)->
			if e? then e.preventDefault()
			type = detail.folder.files[file].type
			if detail.MimeTypeList[type]?
				item = detail.action[detail.MimeTypeList[type]](detail.folder, detail.folder.files[file])
			else
			detail.field.html (item)
			detail.menu.find('a').addClass('disabled').unbind().click (e)-> e.preventDefault()
			detail.menu.find('a.home').removeClass('disabled').click ()-> view.show(index)
			if detail.folder.files[file-1]?
				detail.menu.find('a.backward').removeClass('disabled').click detail.show(file-1)
			if detail.folder.files[file+1]?
				detail.menu.find('a.forward') .removeClass('disabled').click detail.show(file+1)

	action: 
		image: (folder, file)->
			item = $ '<img>'
			item.addClass 'image'
			item.attr 'src', "/folder/#{folder.name}/#{file.name}"
			item.click ()-> detail.menu.find('a.forward').click()
			return item

	MimeTypeList: {
		".jpg": "image"
		".jpeg": "image",
		".png": "image",
		".gif": "image",
		".html": "html"
	}

view.list.push detail