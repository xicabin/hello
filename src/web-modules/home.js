'use strict'

const authz = require(__base + '/authz.js')

function* index() {
	this.body = yield this.render('home/index.jade')
}

function* login() {
	let message = ''
	let body = this.request.body
	if (this.method === 'POST' && body.username && body.password) {
		message = 'Incorrect username or password'
		let user = false
		try {
			user = yield authz.checkUser(body.username, body.password)
		} catch (e) {
			console.error(e)
			message = e.message
		}
		if (user) {
			this.session.user = user
			this.session.expired = Date.now() + 1000 * 60 * 60 * 24 * 7
			this.redirect('/index')
			return
		}
	}
	this.body = yield this.render('home/login.jade', { message: message })
}

function* logout() {
	this.session = null
	this.redirect('/')
}

module.exports = {
	use: (app) => {
		const R = require('koa-route')
		app.use(R.get('/', authz.withAuth(index)))
		app.use(R.get('/index', authz.withAuth(index)))
		app.use(R.get('/logout', logout))
		app.use(R.get('/login', login))
		app.use(R.post('/login', login))
	}
}
