#!/usr/bin/env node

const os = require('os')
const http = require('http')
const connect = require('connect')
const serveStatic = require('serve-static')
const debug = require('debug')
const { Command } = require('commander')

const log = debug('everywhere')

const program = new Command()
program.version('0.0.1')

program
  .option('-p, --port <port>', 'the port to run on', '8000')
  .option('-s, --silent', 'do not open the browser')
  .option('-l, --log', 'print log')
  .option('-d, --dir <dir>', 'dir for the static files', process.cwd())
  .option('-h, --hostname <hostname>', 'the hostname')

program.parse(process.argv)
const options = program.opts()

const app = connect()
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (options.log) {
    log(req.method + ' ' + req.url)
  }
  next()
})

app.use(serveStatic(options.dir, { index: ['index.html'] }))

const port = parseInt(options.port, 10)
const hostname = options.hostname || getIPAddress()

http.createServer(app).listen(port, function () {
  const portFormatted = port != 80 ? ':' + port : ''
  const url = 'http://' + hostname + port + '/'
  console.log('Running at ' + url)
  if (!options.silent) {
    openURL(url)
  }
})

function getIPAddress() {
  const interfaces = os.networkInterfaces()
  let ip = ''
  for (const dev of Object.keys(interfaces)) {
    interfaces[dev].forEach(function (details) {
      if (ip === '' && details.family === 'IPv4' && !details.internal) {
        ip = details.address
        return
      }
    })
  }
  return ip || '127.0.0.1'
}

function openURL(url) {
  console.log('open: ', url)
}
