'use strict'

const crypto = require('crypto')
const conf = require('./conf.js')
const db = require('./db.js')

function* checkUser(username, password) {
	let user = yield db.users.findOne({ username: username })
	if (!user) {
		return false
	}
	let md5 = crypto.createHash('md5')
	if (user.password !== md5.update(password).digest('hex')) {
		return false
	}
	return user
}

function validate(session) {
	return session.user && session.expired && session.expired > Date.now()
}

function withAuth(impl, ...rest) {
	return function* (...args) {
		let checked = validate(this.session)
		if (checked) {
			yield* impl.apply(this, [].concat(args, rest))
		} else {
			this.redirect('/login')
		}
	}
}

module.exports = {
	withAuth: withAuth,
	validate: validate,
	checkUser: checkUser
}
