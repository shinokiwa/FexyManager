$(document).ready ->
	view.init()
	$('h1 > a').click (e)->
		e.preventDefault()
		view.show(index)
	app.get '/info.json', ()->
		if location.hash? && location.hash.length > 1
			view.show(index)
		else
			view.show(detail)

view =
	list: []
	init: ()->
		for v in view.list
			v.init?()
	show: (target)->
		for v in view.list
			v.hidden()
		target.display?()
