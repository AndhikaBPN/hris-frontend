/* ══════════════════════════════════════════════
   EMPLOYEE FETCH FUNCTIONS
══════════════════════════════════════════════ */

async function fetchEmployees(options) {
  options = options || {};
  var page   = options.page   || 1;
  var limit  = options.limit  || 10;
  var search = options.search || '';
  var role   = options.role   || '';

  var isActive = options.is_active;

  var params = '?page=' + page + '&limit=' + limit + '&order_by=name&sorting=asc';
  if (search)                  params += '&search='    + encodeURIComponent(search);
  if (role)                    params += '&role='      + encodeURIComponent(role);
  if (isActive !== undefined && isActive !== '') params += '&is_active=' + isActive;

  var result = await apiRequest('/users' + params);

  if (!result.success) {
    return { success: false, data: [], meta: {}, error: result.error };
  }

  var data = result.data || {};
  return {
    success: true,
    data: Array.isArray(data) ? data : (data.data || []),
    meta: data.meta || {}
  };
}

async function fetchManagers() {
  var res = await fetchEmployees({ page: 1, limit: 100 });
  if (!res.success) return { success: false, data: [], error: res.error };

  var managerRoles = ['c_level', 'hrd_manager', 'technical_manager'];
  var managers = res.data.filter(function(u) {
    return managerRoles.indexOf(u.role) !== -1;
  });

  return { success: true, data: managers, error: null };
}

async function fetchCLevelUsers() {
  var res = await fetchEmployees({ page: 1, limit: 100, role: 'c_level' });
  if (!res.success) return { success: false, data: [], error: res.error };
  return { success: true, data: res.data, error: null };
}

async function createEmployee(payload) {
  if (!payload || !payload.name || !payload.email || !payload.password || !payload.role) {
    return { success: false, data: null, message: 'Name, email, password, and role are required', error: 'Missing required fields' };
  }

  var result = await apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (!result.success) {
    return { success: false, data: null, message: result.error, error: result.error };
  }

  var resData = result.data || {};
  return {
    success: true,
    data: resData.data || {},
    message: resData.message || 'Employee created successfully',
    error: null
  };
}

async function updateEmployee(id, payload) {
  if (!id) return { success: false, data: null, message: 'Employee ID required', error: 'Missing ID' };

  var result = await apiRequest('/users/' + id, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });

  if (!result.success) {
    return { success: false, data: null, message: result.error, error: result.error };
  }

  var resData = result.data || {};
  return {
    success: true,
    data: resData.data || {},
    message: resData.message || 'Employee updated successfully',
    error: null
  };
}

async function deleteEmployee(id) {
  if (!id) return { success: false, message: 'Employee ID required', error: 'Missing ID' };

  var result = await apiRequest('/users/' + id, {
    method: 'DELETE'
  });

  if (!result.success) {
    return { success: false, message: result.error, error: result.error };
  }

  var resData = result.data || {};
  return {
    success: true,
    message: resData.message || 'Employee deleted successfully',
    error: null
  };
}

/* ── FormData helper — used for photo uploads (no Content-Type override) ── */
async function _apiFormData(path, method, formData) {
  var token = localStorage.getItem('hris_token');
  var headers = {};
  if (token) headers['Authorization'] = 'Bearer ' + token;
  try {
    var response = await fetch(getApiUrl(path), { method: method, headers: headers, body: formData });
    if (response.status === 401) {
      handleUnauthorized();
      return { success: false, data: null, error: 'Unauthorized. Please login again.' };
    }
    var data = await response.json().catch(function() { return {}; });
    if (!response.ok) return { success: false, data: null, error: data.message || 'Request failed.' };
    return { success: true, data: data, error: null };
  } catch (err) {
    return { success: false, data: null, error: err.message || 'Network error' };
  }
}

async function createEmployeeWithPhoto(formData) {
  var result = await _apiFormData('/users', 'POST', formData);
  if (!result.success) return { success: false, data: null, message: result.error, error: result.error };
  var resData = result.data || {};
  return { success: true, data: resData.data || {}, message: resData.message || 'Employee created successfully', error: null };
}

async function updateEmployeeWithPhoto(id, formData) {
  if (!id) return { success: false, data: null, message: 'Employee ID required', error: 'Missing ID' };
  formData.append('_method', 'PUT');
  var result = await _apiFormData('/users/' + id, 'POST', formData);
  if (!result.success) return { success: false, data: null, message: result.error, error: result.error };
  var resData = result.data || {};
  return { success: true, data: resData.data || {}, message: resData.message || 'Employee updated successfully', error: null };
}
