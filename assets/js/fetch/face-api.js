/* ══════════════════════════════════════════════
   FACE-API FETCH FUNCTIONS
   Face embeddings + biometric attendance
══════════════════════════════════════════════ */

async function fetchFaceEmbeddings() {
  var result = await apiRequest('/face-embeddings');
  if (!result.success) {
    console.error('Error fetching face embeddings:', result.error);
    return { success: false, data: [] };
  }
  return { success: true, data: extractListData(result) };
}

async function saveFaceEmbedding(embedding) {
  var result = await apiRequest('/face-embeddings', {
    method: 'POST',
    body: JSON.stringify({ embeddings: embedding })
  });
  return { success: result.success, error: result.error };
}

async function clockInAttendance(session, lat, lng, faceImg) {
  var result = await apiRequest('/attendance/clock-in', {
    method: 'POST',
    body: JSON.stringify({
      session:    session,
      latitude:   lat,
      longitude:  lng,
      face_image: faceImg
    })
  });
  if (!result.success) {
    return { success: false, error: result.error };
  }
  var attData = result.data && result.data.data ? result.data.data : {};
  return { success: true, data: attData };
}

async function clockOutAttendance() {
  var result = await apiRequest('/attendance/clock-out', { method: 'POST' });
  if (!result.success) {
    return { success: false, error: result.error };
  }
  var attData = result.data && result.data.data ? result.data.data : {};
  return { success: true, data: attData };
}

async function fetchMyTodayAttendance() {
  var today = new Date().toISOString().slice(0, 10);
  var result = await apiRequest('/attendance/my?page=1&limit=10&date=' + today);
  if (!result.success) {
    console.error('Error fetching today attendance:', result.error);
    return { success: false, data: [] };
  }
  return { success: true, data: extractListData(result) };
}
