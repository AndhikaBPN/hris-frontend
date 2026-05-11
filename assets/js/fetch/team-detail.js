/* ══════════════════════════════════════════════
  TEAM DETAIL FETCH FUNCTIONS
══════════════════════════════════════════════ */

async function fetchTeamDetail(teamId) {
  if (!teamId) {
    return { success: false, data: null, error: 'Team ID required' };
  }

  var result = await apiRequest('/teams/' + teamId);
  if (!result.success) {
    console.error('Error fetching team detail:', result.error);
    return { success: false, data: null, error: result.error };
  }

  return {
    success: true,
    data: extractSingleData(result) || {}
  };
}

async function updateTeam(teamId, data) {
  if (!teamId) {
    return { success: false, error: 'Team ID required' };
  }

  var result = await apiRequest('/teams/' + teamId, {
    method: 'PUT',
    body: JSON.stringify(data)
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return {
    success: true,
    message: result.data?.message || 'Team updated successfully'
  };
}
