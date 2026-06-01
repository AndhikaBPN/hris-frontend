var DEFAULT_API_URL = 'http://localhost:8000';

function getBaseUrl() {
  return ((window.APP_ENV && window.APP_ENV.URL_LOCAL)
    ? window.APP_ENV.URL_LOCAL
    : DEFAULT_API_URL).replace(/\/$/, '');
}

function getApiUrl(path) {
  return getBaseUrl() + '/api' + path;
}
