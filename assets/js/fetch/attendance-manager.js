/* ══════════════════════════════════════════════
  ATTENDANCE MANAGER FETCH FUNCTIONS
══════════════════════════════════════════════ */

async function fetchAttendanceSummary(month) {
  var result = await apiRequest('/attendance/summary?month=' + month);
  if (!result.success) {
    console.error('Error fetching attendance summary:', result.error);
    return { success: false, data: [] };
  }
  return {
    success: true,
    data: extractListData(result)
  };
}

async function fetchTeamAttendance() {
  var result = await apiRequest('/attendance/subordinates/today');
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

async function fetchPersonalAttendance() {
  var result = await apiRequest('/attendance/today');
  if (!result.success) {
    console.error('Error fetching personal attendance:', result.error);
    return { success: false, data: [] };
  }
  return {
    success: true,
    data: extractListData(result)
  };
}
