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
const users = mongoose.model('User', UserSchema)

// Scaffold 属性
// @autofill   function|string  自动计算属性，不需要用户输入
// @showAs     enum             显示形式，支持 [ textarea, radio, select ]
// @showName   string           显示名称，如果不指定，则显示字段名称
// @showIndex  int              显示顺序，按照从小到大自顶向下排列

const PageSchema = new Schema({
	user_id: {
		type: ObjectId,
		required: true,
		index: true,
		autofill: (context) => context.myId()
	},
	title: {
		type: String,
		required: true,
		showIndex: 1
	},
	body: {
		type: String,
		required: true,
		showAs: 'textarea',
		showIndex: 2
	},
	status: {
		type: String,
		required: true,
		default: 'public',
		enum: 'public private draft'.split(/\s+/),
		showAs: 'radio',
		showIndex: 3
	},
	updated: {
		type: Date,
		autofill: Date.now
	}
})
const pages = mongoose.model('Page', PageSchema)
pages.scaffoldName = 'pages'

const scaffold = {}
scaffold[pages.scaffoldName] = pages

module.exports = {
	UserSchema: UserSchema,
	PageSchema: PageSchema,
	users: users,
	pages: pages,
	ObjectId: ObjectId,
	scaffold: scaffold
}
