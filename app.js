'use strict'

const fs = require('fs')
const path = require('path')
const koa = require('koa')
const serve = require('koa-static')
const session = require('koa-session')
const bodyparser = require('koa-bodyparser')
const app = koa()

global.__base = path.join(__dirname, 'src/base-modules')

const port = process.env['port'] || 6969

app.keys = [ process.env['key'] || '~yichexiguakeguile~' ]

app.context.render = require(__base + '/renderer.js')

app.use(session(app))
app.use(bodyparser({ formLimit: '20mb' }))
app.use(serve(path.join(__dirname, '/web/')))

const modulePath = path.join(__dirname, 'src/web-modules/')
let modules = fs.readdirSync(modulePath)
for (let moduleName of modules) {
	let loader = (require(path.join(modulePath, moduleName)) || {}).use
	loader && loader(app)
}

let server = app.listen(port, () =>
	console.log(`Listening at ${server.address().address}:${server.address().port}`)
)
