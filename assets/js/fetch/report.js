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

async function fetchAttendanceReport(year, month) {
  var result = await apiRequest('/reports/attendance?year=' + year + '&month=' + month);
  if (!result.success) return { success: false, data: [], error: result.error };
  return { success: true, data: _extractReportData(result) };
}

async function fetchLeaveReport(year) {
  var result = await apiRequest('/reports/leave?year=' + year);
  if (!result.success) return { success: false, data: [], error: result.error };
  return { success: true, data: _extractReportData(result) };
}

async function fetchEmployeesReport(opts) {
  var params = [];
  if (opts.role)       params.push('role='       + encodeURIComponent(opts.role));
  if (opts.status)     params.push('status='     + encodeURIComponent(opts.status));
  if (opts.manager_id) params.push('manager_id=' + encodeURIComponent(opts.manager_id));
  var qs = params.length ? '?' + params.join('&') : '';
  var result = await apiRequest('/reports/employees' + qs);
  if (!result.success) return { success: false, data: [], error: result.error };
  return { success: true, data: _extractReportData(result) };
}

async function fetchShiftsReport(year, month) {
  var result = await apiRequest('/reports/shifts?year=' + year + '&month=' + month);
  if (!result.success) return { success: false, data: [], error: result.error };
  return { success: true, data: _extractReportData(result) };
}

async function fetchManagersForFilter() {
  var result = await apiRequest('/reports/employees?role=hrd_manager,technical_manager');
  if (!result.success) return [];
  var data = _extractReportData(result);
  return data.filter(function(u) {
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
