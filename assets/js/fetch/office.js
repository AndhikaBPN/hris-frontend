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

async function fetchOfficeLocation(id) {
  var result = await apiRequest('/office-locations/' + id);
  if (!result.success) {
    console.error('Error fetching office location:', result.error);
    return { success: false, data: null };
  }
  return { success: true, data: extractSingleData(result) };
}
