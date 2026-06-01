/* ══════════════════════════════════════════════
   EMPLOYEE DETAIL FETCH FUNCTIONS
══════════════════════════════════════════════ */

async function fetchEmployeeDetail(id) {
  if (!id) return { success: false, data: null, error: 'Employee ID required' };

  var result = await apiRequest('/users/' + id);

  if (!result.success) {
    return { success: false, data: null, error: result.error };
  }

  return {
    success: true,
    data: extractSingleData(result) || {}
  };
}
