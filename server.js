const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

function parseEnv() {
  try {
    var content = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    return content.split('\n').reduce(function(acc, line) {
      var trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return acc;
      var sep = trimmed.indexOf('=');
      if (sep === -1) return acc;
      var key = trimmed.slice(0, sep).trim();
      var val = trimmed.slice(sep + 1).trim().replace(/^["']|["']$/g, '');
      acc[key] = val;
      return acc;
    }, {});
  } catch (e) {
    return {};
  }
}

function generateEnvJs(env) {
  var config = {
    URL_LOCAL: env.URL_LOCAL || 'http://localhost:8000',
    ALLOWED_ORIGINS: env.ALLOWED_ORIGINS
  };
  var content = '/* auto-generated from .env — do not edit */\nvar APP_ENV = ' + JSON.stringify(config, null, 2) + ';\n';
  fs.writeFileSync(path.join(__dirname, 'assets/js/env.js'), content, 'utf8');
}

var env = parseEnv();
generateEnvJs(env);

const PORT = parseInt(env.PORT || '3000', 10);
const ALLOWED_ORIGINS = (env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(function(o) { return o.trim(); })
  .filter(Boolean)
  .concat(['http://localhost:' + parseInt(env.PORT || '3000', 10)]);

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

http.createServer(function(req, res) {
  var origin = req.headers['origin'];
  if (origin && ALLOWED_ORIGINS.indexOf(origin) !== -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:' + PORT);
  }

  var pathname = url.parse(req.url).pathname;

  var ROUTES = {
    '/set-password':      'pages/set-password.html',
    '/report/attendance': 'pages/report/attendance.html',
    '/report/leave':      'pages/report/leave.html',
    '/report/employees':  'pages/report/employees.html',
    '/report/shifts':     'pages/report/shifts.html'
  };
  var routedPath = ROUTES[pathname];
  var filePath = path.join(__dirname, routedPath || (pathname === '/' ? 'index.html' : pathname));
  var ext = path.extname(filePath);

  fs.readFile(filePath, function(err, data) {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    var headers = { 'Content-Type': MIME[ext] || 'text/plain' };
    /* Prevent browser from caching CSS/JS during development */
    if (ext === '.css' || ext === '.js') {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    }
    res.writeHead(200, headers);
    res.end(data);
  });

}).listen(PORT, function() {
  console.log('Frontend running at http://localhost:' + PORT);
});
