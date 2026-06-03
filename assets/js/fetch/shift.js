/* ══════════════════════════════════════════════
   SHIFT FETCH FUNCTIONS
══════════════════════════════════════════════ */

async function fetchMasterShifts() {
  var result = await apiRequest('/shifts?page=1&limit=50&order_by=id&sorting=ASC');
  if (!result.success) return { success: false, data: [], error: result.error };
  var body = result.data || {};
  var list = Array.isArray(body) ? body : (body.data || []);
  return { success: true, data: list };
}

async function fetchShiftScheduleList(options) {
  options = options || {};
  var page  = options.page  || 1;
  var limit = options.limit || 15;

  var params = '?page=' + page + '&limit=' + limit;
  if (options.name)       params += '&name='       + encodeURIComponent(options.name);
  if (options.team)       params += '&team='       + encodeURIComponent(options.team);
  if (options.date)       params += '&date='       + encodeURIComponent(options.date);
  if (options.start_date) params += '&start_date=' + encodeURIComponent(options.start_date);
  if (options.end_date)   params += '&end_date='   + encodeURIComponent(options.end_date);

  var result = await apiRequest('/shift-schedules' + params);
  if (!result.success) return { success: false, data: [], meta: {}, error: result.error };

  var body = result.data || {};
  return {
    success: true,
    data: Array.isArray(body) ? body : (body.data || []),
    meta: body.meta || {}
  };
}

async function fetchShiftableEmployees() {
  var result = await apiRequest('/users?limit=200&order_by=name&sorting=asc');
  if (!result.success) return { success: false, data: [], error: result.error };
  var body = result.data || {};
  var all  = Array.isArray(body) ? body : (body.data || []);
  var filtered = all.filter(function(u) {
    return u.role === 'staff' || u.role === 'team_leader';
  });
  return { success: true, data: filtered };
}

async function createShiftSchedulesBulk(payload) {
  return await apiRequest('/shift-schedules/bulk', { method: 'POST', body: JSON.stringify(payload) });
}

async function updateShiftSchedulesBulk(payload) {
  return await apiRequest('/shift-schedules/bulk', { method: 'PUT', body: JSON.stringify(payload) });
}

async function deleteShiftSchedule(id) {
  return await apiRequest('/shift-schedules/' + id, { method: 'DELETE' });
}

async function importShiftSchedules(file) {
  var token    = localStorage.getItem('hris_token');
  var formData = new FormData();
  formData.append('file', file);
  try {
    var response = await fetch(getApiUrl('/shift-schedules/import'), {
      method:  'POST',
      headers: { 'Authorization': 'Bearer ' + (token || '') },
      body:    formData
    });
    var json = await response.json().catch(function() { return {}; });
    if (!response.ok) return { success: false, data: null, error: json.message || 'Import failed.' };
    return { success: true, data: json.data || null, message: json.message || '' };
  } catch (e) {
    return { success: false, data: null, error: e.message || 'Network error' };
  }
}
