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
  };
  var content = '/* auto-generated from .env — do not edit */\nvar APP_ENV = ' + JSON.stringify(config, null, 2) + ';\n';
  fs.writeFileSync(path.join(__dirname, 'assets/js/env.js'), content, 'utf8');
}

var env = parseEnv();
generateEnvJs(env);

const PORT = parseInt(env.PORT || '3000', 10);

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
  res.setHeader('Access-Control-Allow-Origin', '*');

  var pathname = url.parse(req.url).pathname;
  var filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
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
