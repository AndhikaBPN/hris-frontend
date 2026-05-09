/* ══════════════════════════════════════════════
  DASHBOARD FETCH FUNCTIONS (shared)
══════════════════════════════════════════════ */

async function fetchAttendanceToday(role) {
  var path = role === 'team'
    ? '/attendance/subordinates/today'
    : '/attendance/today?role=' + role;

  var result = await apiRequest(path);
  if (!result.success) {
    console.error('Error fetching ' + role + ' attendance:', result.error);
    return { success: false, data: [] };
  }
  return {
    success: true,
    data: extractListData(result)
  };
}

async function fetchCount(path) {
  var result = await apiRequest(path);
  if (!result.success) {
    console.error('Error fetching count:', result.error);
    return { success: false, data: {} };
  }
  return {
    success: true,
    data: extractSingleData(result) || {}
  };
}

async function fetchBirthdays() {
  var result = await apiRequest('/users/birthdays');
  if (!result.success) {
    console.error('Error fetching birthdays:', result.error);
    return { success: false, data: [] };
  }
  return {
    success: true,
    data: extractListData(result)
  };
}

async function fetchLeaveRequests() {
  var result = await apiRequest('/leave/monthly');
  if (!result.success) {
    console.error('Error fetching leave requests:', result.error);
    return { success: false, data: [] };
  }
  return {
    success: true,
    data: extractListData(result)
  };
}

async function fetchLeaveQuota() {
  var result = await apiRequest('/leave/quota');
  if (!result.success) {
    console.error('Error fetching leave quota:', result.error);
    return { success: false, data: {} };
  }
  return {
    success: true,
    data: extractSingleData(result) || {}
  };
}

async function performLogout() {
  await apiRequest('/logout', { method: 'POST' });
  localStorage.removeItem('hris_token');
  localStorage.removeItem('hris_user');
}
