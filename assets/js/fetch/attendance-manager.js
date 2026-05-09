/* ══════════════════════════════════════════════
  ATTENDANCE MANAGER FETCH FUNCTIONS
══════════════════════════════════════════════ */

async function fetchAttendanceSummary(month) {
  var params = '?month=' + month;
  var result = await apiRequest('/attendance/summary' + params);
  if (!result.success) {
    console.error('Error fetching attendance summary:', result.error);
    return { success: false, data: [] };
  }
  return {
    success: true,
    data: extractListData(result)
  };
}

async function fetchTeamAttendance(filters) {
  filters = filters || {};
  var params = '';

  if (filters.from) params += '&date_from=' + filters.from;
  if (filters.to) params += '&date_to=' + filters.to;
  if (filters.status) params += '&status=' + filters.status;
  if (filters.division) params += '&division=' + filters.division;
  if (filters.page) params += '&page=' + filters.page;
  if (filters.limit) params += '&limit=' + (filters.limit || 10);

  if (params) params = '?' + params.substring(1);

  var result = await apiRequest('/attendance/subordinates' + params);
  if (!result.success) {
    console.error('Error fetching team attendance:', result.error);
    return { success: false, data: [], meta: {} };
  }
  return {
    success: true,
    data: extractListData(result),
    meta: extractMeta(result)
  };
}

async function fetchPersonalAttendance(filters) {
  filters = filters || {};
  var params = '';

  if (filters.from) params += '&date_from=' + filters.from;
  if (filters.to) params += '&date_to=' + filters.to;
  if (filters.status) params += '&status=' + filters.status;

  if (params) params = '?' + params.substring(1);

  var result = await apiRequest('/attendance/today' + params);
  if (!result.success) {
    console.error('Error fetching personal attendance:', result.error);
    return { success: false, data: [] };
  }
  return {
    success: true,
    data: extractListData(result)
  };
}
