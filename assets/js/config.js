var DEFAULT_API_URL = 'http://localhost:8000/api';

function getApiUrl(path) {
  var base = (window.APP_ENV && window.APP_ENV.URL_LOCAL)
    ? window.APP_ENV.URL_LOCAL
    : DEFAULT_API_URL;
  return base.replace(/\/$/, '') + path;
}
