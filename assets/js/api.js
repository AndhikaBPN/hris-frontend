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

function extractListData(result) {
  if (!result || !result.data) return [];
  var d = result.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d.data)) return d.data;
  return [];
}

function extractSingleData(result) {
  if (!result || !result.data) return null;
  var d = result.data;
  if (d && !Array.isArray(d) && Object.prototype.hasOwnProperty.call(d, 'data')) return d.data;
  return d;
}

function extractMeta(result) {
  if (!result || !result.data) return {};
  var d = result.data;
  if (d && !Array.isArray(d) && d.meta) return d.meta;
  return {};
}

async function apiRequest(path, options) {
  var requestOptions = options || {};
  var token = localStorage.getItem('hris_token');
  var headers = Object.assign(
    { 'Content-Type': 'application/json' },
    token ? { Authorization: 'Bearer ' + token } : {},
    requestOptions.headers || {}
  );

  try {
    var response = await fetch(getApiUrl(path), Object.assign({}, requestOptions, {
      headers: headers
    }));

    if (response.status === 401 && path !== '/login') {
      handleUnauthorized();
      return { success: false, data: null, error: 'Unauthorized. Please login again.' };
    }

    var data = await response.json().catch(function() {
      return {};
    });

    if (!response.ok) {
      var errorMsg = data.message || 'Request failed.';
      return { success: false, data: null, error: errorMsg };
    }

    return { success: true, data: data, error: null };
  } catch (err) {
    return { success: false, data: null, error: err.message || 'Network error' };
  }
}
