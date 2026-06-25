/* ══════════════════════════════════════════════
   REPORT FETCH FUNCTIONS
══════════════════════════════════════════════ */

function _extractReportData(result) {
  if (!result || !result.data) return [];
  var d = result.data;
  if (Array.isArray(d)) return d;
  if (d && d.data) {
    if (Array.isArray(d.data)) return d.data;
    if (d.data && Array.isArray(d.data.data)) return d.data.data;
  }
  return [];
}

function _extractReportMeta(result) {
  if (!result || !result.data) return null;
  var d = result.data;
  // shape: { data: [...], meta: {...} }
  if (d.meta) return d.meta;
  // shape: { data: { data: [...], meta: {...} } }
  if (d.data && d.data.meta) return d.data.meta;
  return null;
}

async function fetchAttendanceReport(year, month, page, limit) {
  var p = page  || 1;
  var l = limit || 25;
  var result = await apiRequest('/reports/attendance?year=' + year + '&month=' + month + '&page=' + p + '&limit=' + l);
  if (!result.success) return { success: false, data: [], meta: null, error: result.error };
  return { success: true, data: _extractReportData(result), meta: _extractReportMeta(result) };
}

async function fetchLeaveReport(year, page, limit) {
  var p = page  || 1;
  var l = limit || 25;
  var result = await apiRequest('/reports/leave?year=' + year + '&page=' + p + '&limit=' + l);
  if (!result.success) return { success: false, data: [], meta: null, error: result.error };
  return { success: true, data: _extractReportData(result), meta: _extractReportMeta(result) };
}

async function fetchEmployeesReport(opts) {
  var page  = opts.page  || 1;
  var limit = opts.limit || 25;
  var params = ['page=' + page, 'limit=' + limit];
  if (opts.role)       params.push('role='       + encodeURIComponent(opts.role));
  if (opts.status)     params.push('status='     + encodeURIComponent(opts.status));
  if (opts.manager_id) params.push('manager_id=' + encodeURIComponent(opts.manager_id));
  var result = await apiRequest('/reports/employees?' + params.join('&'));
  if (!result.success) return { success: false, data: [], meta: null, error: result.error };
  return { success: true, data: _extractReportData(result), meta: _extractReportMeta(result) };
}

async function fetchShiftsReport(year, month, page, limit) {
  var p = page  || 1;
  var l = limit || 50;
  var result = await apiRequest('/reports/shifts?year=' + year + '&month=' + month + '&page=' + p + '&limit=' + l);
  if (!result.success) return { success: false, data: [], meta: null, error: result.error };
  return { success: true, data: _extractReportData(result), meta: _extractReportMeta(result) };
}

async function fetchManagersForFilter() {
  var result = await apiRequest('/users?page=1&limit=100');
  if (!result.success) return [];
  var list = extractListData(result);
  return list.filter(function(u) {
    return u.role === 'hrd_manager' || u.role === 'technical_manager' || u.role === 'c_level';
  });
}

async function exportReportFile(type, params) {
  var qparts = [];
  Object.keys(params).forEach(function(k) {
    if (params[k] !== null && params[k] !== undefined && params[k] !== '') {
      qparts.push(k + '=' + encodeURIComponent(params[k]));
    }
  });
  var url = getApiUrl('/reports/' + type + '/export') + (qparts.length ? '?' + qparts.join('&') : '');
  var token = localStorage.getItem('hris_token');
  try {
    var response = await fetch(url, { headers: { 'Authorization': 'Bearer ' + token } });
    if (!response.ok) return { success: false, error: 'Server returned ' + response.status };
    var blob = await response.blob();
    var blobUrl = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = blobUrl;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(blobUrl); }, 2000);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
