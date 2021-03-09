#!/usr/bin/env node

const os = require('os')
const http = require('http')
const connect = require('connect')
const serveStatic = require('serve-static')
const serveIndex = require('serve-index')
const debug = require('debug')
const figlet = require('figlet')
const { Command } = require('commander')
const { exec, spawn } = require('child_process')

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
app.use(serveIndex(options.dir, { icons: true }))

const port = parseInt(options.port, 10)
const hostname = options.hostname || getIPAddress()

figlet('EveryWhere', function (err, data) {
  if (err) {
    console.log('Something went wrong...')
    console.dir(err)
    return
  }
  console.log(data)
  http.createServer(app).listen(port, function () {
    const portFormatted = port != 80 ? ':' + port : ''
    const url = 'http://' + hostname + portFormatted + '/'
    console.log('Running at ' + url)
    if (!options.silent) {
      openURL(url)
    }
  })
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
  switch (process.platform) {
    case 'darwin':
      exec('open ' + url)
      break
    case 'win32':
      exec('start ' + url)
      break
    default:
      spawn('xdg-open', [url])
  }
}
