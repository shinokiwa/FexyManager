login=
	init: ->
		$('#login').submit (e)->
			e.preventDefault()
			app.post $('#login'), ()->
	
	display: ->
		$('#LoginForm input[type="text"]').val('');
		$('#LoginForm').show()

	hidden: ->
		$('#LoginForm').hide()

view.list.push login