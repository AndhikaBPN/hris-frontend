/* ══════════════════════════════════════════════
  ATTENDANCE FETCH FUNCTIONS
══════════════════════════════════════════════ */

async function fetchAttendance(filters) {
  var token = localStorage.getItem('hris_token') || '';
  if (!token) return { success: false, data: [], error: 'Not authenticated' };

  var path = '/attendance?page=1&limit=50&order_by=id&sorting=DESC';
  if (filters.date_from) path += '&date_from=' + filters.date_from;
  if (filters.date_to) path += '&date_to=' + filters.date_to;

  var result = await apiRequest(path);
  if (result.success) {
    return {
      success: true,
      data: extractListData(result),
      error: null
    };
  }
  return { success: false, data: [], error: result.error };
}

async function fetchShifts(year, month) {
  var token = localStorage.getItem('hris_token') || '';
  if (!token) return { success: false, data: [], error: 'Not authenticated' };

  var pad = function(n) { return n < 10 ? '0' + n : '' + n; };
  var firstDay = year + '-' + pad(month + 1) + '-01';
  var lastDay = year + '-' + pad(month + 1) + '-' + pad(new Date(year, month + 1, 0).getDate());
  var path = '/shifts?page=1&limit=31&order_by=date&sorting=ASC&date_from=' + firstDay + '&date_to=' + lastDay;

  var result = await apiRequest(path);
  if (result.success) {
    return {
      success: true,
      data: extractListData(result),
      error: null
    };
  }
  return { success: false, data: [], error: result.error };
}
