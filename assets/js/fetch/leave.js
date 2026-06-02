/* ══════════════════════════════════════════════
   LEAVE REQUEST — FETCH LAYER
   All functions return { success, data, meta, error }
   API endpoints TBD — ready for integration
══════════════════════════════════════════════ */

async function fetchLeaveList(options) {
  options = options || {};
  var page       = options.page       || 1;
  var limit      = options.limit      || 15;
  var name       = options.name       || '';
  var team       = options.team       || '';
  var type       = options.type       || '';
  var status     = options.status     || '';
  var date_from  = options.date_from  || '';
  var date_to    = options.date_to    || '';
  var team_id    = options.team_id    || '';

  var params = '?page=' + page + '&limit=' + limit;
  if (name)      params += '&name='      + encodeURIComponent(name);
  if (team)      params += '&team='      + encodeURIComponent(team);
  if (type)      params += '&type='      + encodeURIComponent(type);
  if (status)    params += '&status='    + encodeURIComponent(status);
  if (date_from) params += '&date_from=' + encodeURIComponent(date_from);
  if (date_to)   params += '&date_to='   + encodeURIComponent(date_to);
  if (team_id)   params += '&team_id='   + encodeURIComponent(team_id);

  var result = await apiRequest('/leave-requests' + params);
  if (!result.success) {
    return { success: false, data: [], meta: {}, error: result.error };
  }
  var data = result.data || {};
  return {
    success: true,
    data: data.data || data || [],
    meta: data.meta || {}
  };
}

async function fetchLeaveSummary() {
  var result = await apiRequest('/leave-requests/summary');
  if (!result.success) {
    return { success: false, data: null, error: result.error };
  }
  return { success: true, data: result.data || {} };
}

async function fetchLeaveDetail(id) {
  var result = await apiRequest('/leave-requests/' + id);
  if (!result.success) {
    return { success: false, data: null, error: result.error };
  }
  return { success: true, data: result.data || {} };
}

async function createLeaveRequest(formData) {
  var token = localStorage.getItem('hris_token');
  try {
    var response = await fetch(getApiUrl('/leave-requests'), {
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
  var result = await apiRequest('/leave-requests/' + id + '/cancel', { method: 'PUT' });
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true, message: result.message || 'Leave request cancelled' };
}

async function fetchPendingApprovals(options) {
  options = options || {};
  var page  = options.page  || 1;
  var limit = options.limit || 15;

  var params = '?page=' + page + '&limit=' + limit + '&status=pending';
  var result = await apiRequest('/leave-requests/approvals' + params);
  if (!result.success) {
    return { success: false, data: [], meta: {}, error: result.error };
  }
  var data = result.data || {};
  return {
    success: true,
    data: data.data || data || [],
    meta: data.meta || {}
  };
}

async function approveLeaveRequest(id) {
  var result = await apiRequest('/leave-requests/' + id + '/approve', { method: 'PUT' });
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true, message: result.message || 'Leave request approved' };
}

async function rejectLeaveRequest(id, reason) {
  var result = await apiRequest('/leave-requests/' + id + '/reject', {
    method: 'PUT',
    body: JSON.stringify({ reason: reason || '' })
  });
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true, message: result.message || 'Leave request rejected' };
}
