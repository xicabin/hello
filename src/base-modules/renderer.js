'use strict'

const fs = require('co-fs')
const J = require('jade')
const path = require('path')
const conf = require('./conf.js')

function applyHelpers(options) {
	options.APP_NAME = conf.APP_NAME
	options.moment = require('moment')
}

module.exports = (function() {
	let _compilers = new Map() // Use custom cache for further opt

	let _debug = process.env['debug'] === 'true'

	return function* (view, options) {
		if (!options) {
			options = {}
		}
		if (this && this.session) {
			options._user = this.session.user
		}
		applyHelpers(options)
		let filename = path.join(__dirname, '../../view', view)
		let compiler = _debug ? null : _compilers.get(filename)
		if (!compiler) {
			let tpl = yield fs.readFile(filename)
			compiler = J.compile(tpl, {
				filename: filename,
				cache: false,// Use custom cache instead
				pretty: _debug
			})
			_compilers.set(filename, compiler)
		}
		return compiler(options)
	}
})()
