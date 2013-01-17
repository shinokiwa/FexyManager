mongoose = require 'mongoose'
Schema = mongoose.Schema
ObjectId = Schema.ObjectId
crypto = require 'crypto'

UsersSchema = new Schema
	userName: String
	password: String
	created: { type: Date, default: Date.now }
	createdUser: String
	updated: { type: Date, default: Date.now }
	updatedUser: String

UsersSchema.virtual('prePassword').set (prePassword)->
	console.log "Start to crypting."
	sha1sum = crypto.createHash 'sha1'
	crypted = sha1sum.update(prePassword).digest('hex')
	console.log "Crypted: #{crypted}"
	@set "password", crypted

Users = mongoose.model 'Users', UsersSchema

module.exports = Users

module.exports.findUser = (userName, prePassword, next) ->
		console.log "[UsersSchama.findUser]Start to finding user : #{userName}"
		user = new Users
		user.userName = userName
		user.prePassword = prePassword
		Users.find {
			userName: user.userName
			password: user.password
		}, (e, data) ->
			if data.length > 0
				console.log "User found."
				next (data)
			else
				console.log "User not found."
				next ([])


###
user = new module.exports
user.userName = "admin"
user.prePassword = "admin"
user.save()
###