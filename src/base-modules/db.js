'use strict'

const mongoose = require('mongoose')
const conf = require('./conf.js')

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

mongoose.Promise = global.Promise
mongoose.connect(conf.MONGO_CONN)

const UserSchema = new Schema({
	username: {
		type: String,
		index: true,
		unique: true
	},
	password: String,
	roles: [ String ],
	logined: Date,
	created: Date
})

module.exports = {
	UserSchema: UserSchema,
	users: mongoose.model('User', UserSchema),
	ObjectId: ObjectId
}
