/* ══════════════════════════════════════════════
   EMPLOYEE FETCH FUNCTIONS
══════════════════════════════════════════════ */

async function fetchEmployees(options) {
  options = options || {};
  var page   = options.page   || 1;
  var limit  = options.limit  || 10;
  var search = options.search || '';
  var role   = options.role   || '';

  var params = '?page=' + page + '&limit=' + limit;
  if (search) params += '&search=' + encodeURIComponent(search);
  if (role)   params += '&role='   + encodeURIComponent(role);

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
