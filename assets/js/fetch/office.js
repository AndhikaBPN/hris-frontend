/* ══════════════════════════════════════════════
   OFFICE FETCH FUNCTIONS
══════════════════════════════════════════════ */

async function fetchOfficeLocations() {
  var result = await apiRequest('/office-locations');
  if (!result.success) {
    console.error('Error fetching office locations:', result.error);
    return { success: false, data: [] };
  }
  return { success: true, data: extractListData(result) };
}
