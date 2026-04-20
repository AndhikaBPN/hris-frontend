var ENV_CACHE = null;
var DEFAULT_API_URL = 'http://localhost:8000/api';

async function loadEnv() {
  if (ENV_CACHE) return ENV_CACHE;

  try {
    var response = await fetch('/.env', { cache: 'no-store' });
    if (!response.ok) throw new Error('Env file not found');

    var envText = await response.text();
    ENV_CACHE = envText.split('\n').reduce(function(env, line) {
      var trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) return env;

      var separatorIndex = trimmedLine.indexOf('=');
      if (separatorIndex === -1) return env;

      var key = trimmedLine.slice(0, separatorIndex).trim();
      var value = trimmedLine.slice(separatorIndex + 1).trim();
      env[key] = value.replace(/^["']|["']$/g, '');
      return env;
    }, {});
  } catch (err) {
    ENV_CACHE = {};
    console.warn('Failed to load .env, using default API URL.', err);
  }

  return ENV_CACHE;
}

async function getApiUrl(path) {
  var env = await loadEnv();
  var baseUrl = (env.URL_LOCAL || DEFAULT_API_URL).replace(/\/$/, '');
  return baseUrl + path;
}
