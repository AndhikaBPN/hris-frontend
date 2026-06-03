var DEFAULT_API_URL = 'http://localhost:8000';

function getBaseUrl() {
  var base = ((window.APP_ENV && window.APP_ENV.URL_LOCAL)
    ? window.APP_ENV.URL_LOCAL
    : DEFAULT_API_URL).replace(/\/$/, '');
  var isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(base);
  if (!isLocalhost && base.startsWith('http://')) {
    console.warn('[HRIS] API URL uses HTTP in a non-localhost environment. Use HTTPS in production.');
  }
  return base;
}

function getApiUrl(path) {
  return getBaseUrl() + '/api' + path;
}
