function handleUnauthorized() {
  localStorage.removeItem('hris_token');
  localStorage.removeItem('hris_user');
  var href = window.location.href;
  var pagesMatch = href.match(/(.*\/pages\/)/);
  window.location.replace(pagesMatch ? pagesMatch[1] + 'login.html' : 'login.html');
}

(function() {
  var _originalFetch = window.fetch;
  window.fetch = async function() {
    var response = await _originalFetch.apply(this, arguments);
    var url = typeof arguments[0] === 'string' ? arguments[0] : (arguments[0].url || '');
    if (response.status === 401 && !url.endsWith('/login') && !url.endsWith('/config')) {
      handleUnauthorized();
    }
    return response;
  };
})();

async function apiRequest(path, options) {
  var requestOptions = options || {};
  var token = localStorage.getItem('hris_token');
  var headers = Object.assign(
    { 'Content-Type': 'application/json' },
    token ? { Authorization: 'Bearer ' + token } : {},
    requestOptions.headers || {}
  );

  var response = await fetch(getApiUrl(path), Object.assign({}, requestOptions, {
    headers: headers
  }));

  if (response.status === 401 && path !== '/login') {
    handleUnauthorized();
    return;
  }

  var data = await response.json().catch(function() {
    return {};
  });

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
}
