async function apiRequest(path, options) {
  var requestOptions = options || {};
  var token = localStorage.getItem('hris_token');
  var headers = Object.assign(
    { 'Content-Type': 'application/json' },
    token ? { Authorization: 'Bearer ' + token } : {},
    requestOptions.headers || {}
  );

  var response = await fetch(await getApiUrl(path), Object.assign({}, requestOptions, {
    headers: headers
  }));

  var data = await response.json().catch(function() {
    return {};
  });

  if (!response.ok) {
    throw new Error(data.message || 'Request gagal.');
  }

  return data;
}
