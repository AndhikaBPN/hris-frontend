/* ══════════════════════════════════════════════
   LEAVE REQUEST — FETCH LAYER
   All functions return { success, data, meta, error }
══════════════════════════════════════════════ */

async function fetchLeaveList(options) {
  options = options || {};
  var page      = options.page      || 1;
  var limit     = options.limit     || 15;
  var search    = options.name      || options.search || '';
  var type      = options.type      || '';
  var status    = options.status    || '';
  var date_from = options.date_from || '';
  var date_to   = options.date_to   || '';

  var params = '?page=' + page + '&limit=' + limit;
  if (search)    params += '&search='     + encodeURIComponent(search);
  if (type)      params += '&leave_type=' + encodeURIComponent(type);
  if (status)    params += '&status='     + encodeURIComponent(status);
  if (date_from) params += '&date_from='  + encodeURIComponent(date_from);
  if (date_to)   params += '&date_to='    + encodeURIComponent(date_to);

  var result = await apiRequest('/leave' + params);
  if (!result.success) {
    return { success: false, data: [], meta: {}, error: result.error };
  }
  return {
    success: true,
    data: extractListData(result),
    meta: extractMeta(result)
  };
}

async function fetchLeaveSummary() {
  var result = await apiRequest('/leave/quota');
  if (!result.success) {
    return { success: false, data: null, error: result.error };
  }
  return { success: true, data: extractSingleData(result) || {} };
}

async function fetchLeaveDetail(id) {
  var result = await apiRequest('/leave/' + id);
  if (!result.success) {
    return { success: false, data: null, error: result.error };
  }
  return { success: true, data: extractSingleData(result) || {} };
}

async function createLeaveRequest(formData) {
  var token = localStorage.getItem('hris_token');
  try {
    var response = await fetch(getApiUrl('/leave'), {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: formData
    });
    var json = await response.json();
    if (!response.ok) {
      return { success: false, error: json.message || json.error || 'Request failed' };
    }
    return { success: true, data: json.data || json, message: json.message || 'Leave request submitted' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function cancelLeaveRequest(id) {
  var result = await apiRequest('/leave/' + id + '/cancel', { method: 'PUT' });
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true, message: result.message || 'Leave request cancelled' };
}

async function fetchPendingApprovals(options) {
  options = options || {};
  var page  = options.page  || 1;
  var limit = options.limit || 50;

  var params = '?page=' + page + '&limit=' + limit + '&status=pending';
  var result = await apiRequest('/leave' + params);
  if (!result.success) {
    return { success: false, data: [], meta: {}, error: result.error };
  }
  return {
    success: true,
    data: extractListData(result),
    meta: extractMeta(result)
  };
}

async function approveLeaveRequest(id) {
  var result = await apiRequest('/leave/' + id + '/approve', { method: 'PUT' });
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true, message: result.message || 'Leave request approved' };
}

async function rejectLeaveRequest(id, reason) {
  var result = await apiRequest('/leave/' + id + '/reject', {
    method: 'PUT',
    body: JSON.stringify({ reason: reason || '' })
  });
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true, message: result.message || 'Leave request rejected' };
}
