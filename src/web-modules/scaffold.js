'use strict'

const authz = require(__base + '/authz.js')
const db = require(__base + '/db.js')

function getFields(model) {
	let fields = Object.assign({}, model.schema.paths)
	Object.keys(fields).forEach(field => /^__/.test(field) && delete fields[field])

	return fields
}

function getAutofill(context, model, field, fall) {
	let def = model.schema.paths[field]
	if (def && def.options.autofill !== undefined && def.options.autofill !== false) {
		let autofill = def.options.autofill
		return typeof(autofill) === 'function' ? autofill(context) : autofill
	}
	return fall
}

function* index(scaffoldName) {
	// FIXME not implement, find pages by user_id with sort, pagination, filter and ...
}

function* saveAjax(scaffoldName) {
	let model = db.scaffold[scaffoldName] || this.throw(`Unsupported model "${scaffoldName}"`, 400)

	let body = this.request.body
	let id = body._id
	let fields = getFields(model)
	delete fields._id
	Object.keys(fields).forEach(field => fields[field] = getAutofill(this, model, field, body[field]))

	let document = null
	try {
		if (id) {
			document = yield model.findOneAndUpdate({ _id: id, user_id: this.myId() }, fields, { new: true, runValidators: true })
		} else {
			document = yield model.create(fields)
		}
	} catch (e) {
		console.error(e)
		this.throw(e.toString(), 400)
	}
	this.body = { result: true, document: document }
}

function* add(scaffoldName) {
	let model = db.scaffold[scaffoldName] || this.throw(`Unsupported model "${scaffoldName}"`, 400)

	this.body = yield this.render('scaffold/save.jade', {
		model: model,
		fields: getFields(model)
	})
}

function* edit(scaffoldName, id) {
	let model = db.scaffold[scaffoldName] || this.throw(`Unsupported model "${scaffoldName}"`, 400)

	let fields = getFields(model)
	let document = null
	try {
		document = yield model.findOne({ _id: id, user_id: this.myId() })
	} catch (e) {
		console.error(e)
	}

	if (!document) {
		return this.throw(`"${id}" is not editable`, 400)
	}

	this.body = yield this.render('scaffold/save.jade', {
		model: model,
		fields: fields,
		document: document
	})
}

module.exports = {
	use: (app) => {
		const R = require('koa-route')
		app.use(R.post('/r/scaffold/:model/save', authz.withAuth(saveAjax)))
		app.use(R.get('/scaffold/:model/index', authz.withAuth(index)))
		app.use(R.get('/scaffold/:model/add', authz.withAuth(add)))
		app.use(R.get('/scaffold/:model/edit/:id', authz.withAuth(edit)))
	}
}
