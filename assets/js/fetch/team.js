/* ══════════════════════════════════════════════
  TEAM FETCH FUNCTIONS
══════════════════════════════════════════════ */

async function fetchTeams(options) {
  options = options || {};
  var page = options.page || 1;
  var limit = options.limit || 50;
  var orderBy = options.order_by || 'id';
  var sorting = options.sorting || 'asc';
  var search = options.search || '';

  var params = '?page=' + page + '&limit=' + limit + '&order_by=' + orderBy + '&sorting=' + sorting;
  if (search) params += '&search=' + encodeURIComponent(search);

  var result = await apiRequest('/teams' + params);

  if (!result.success) {
    console.error('Error fetching teams:', result.error);
    return { success: false, data: [], meta: {}, error: result.error };
  }

  var data = result.data || {};
  return {
    success: true,
    data: data.data || [],
    meta: data.meta || {}
  };
}

async function getAllTeams(options) {
  options = options || {};
  var limit = options.limit || 100;
  return await fetchTeams({
    page: 1,
    limit: limit,
    order_by: 'id',
    sorting: 'asc'
  });
}

async function fetchTeamLeaders(options) {
  options = options || {};
  var page = options.page || 1;
  var limit = options.limit || 50;

  var params = '?page=' + page + '&per_page=' + limit;
  var result = await apiRequest('/users/team-leaders' + params);

  if (!result.success) {
    console.error('Error fetching team leaders:', result.error);
    return { success: false, data: [], meta: {}, error: result.error };
  }

  var data = result.data || {};
  return {
    success: true,
    data: Array.isArray(data) ? data : (data.data || []),
    meta: data.meta || {}
  };
}

async function getAllTeamLeaders(options) {
  options = options || {};
  var limit = options.limit || 50;
  return await fetchTeamLeaders({
    page: 1,
    limit: limit
  });
}

async function deleteTeam(teamId) {
  if (!teamId) {
    return { success: false, error: 'Team ID required' };
  }

  var result = await apiRequest('/teams/' + teamId, {
    method: 'DELETE'
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return {
    success: true,
    message: (result.data && result.data.message) || 'Team deleted successfully'
  };
}

async function fetchUsers(options) {
  options = options || {};
  var page = options.page || 1;
  var limit = options.limit || 100;
  var search = options.search || '';

  var params = '?page=' + page + '&limit=' + limit;
  if (search) params += '&search=' + encodeURIComponent(search);

  var result = await apiRequest('/users' + params);

  if (!result.success) {
    console.error('Error fetching users:', result.error);
    return { success: false, data: [], meta: {}, error: result.error };
  }

  var data = result.data || {};
  return {
    success: true,
    data: Array.isArray(data) ? data : (data.data || []),
    meta: data.meta || {}
  };
}

async function createTeam(data) {
  if (!data || !data.team_name || !data.team_lead_id) {
    return {
      success: false,
      data: null,
      message: 'Team name and team lead ID are required',
      error: 'Missing required fields'
    };
  }

  var result = await apiRequest('/teams', {
    method: 'POST',
    body: JSON.stringify({
      team_name: data.team_name,
      team_lead_id: data.team_lead_id
    })
  });

  if (!result.success) {
    return {
      success: false,
      data: null,
      message: result.error,
      error: result.error
    };
  }

  var resData = result.data || {};
  return {
    success: true,
    data: resData.data || {},
    message: resData.message || 'Team created successfully',
    error: null
  };
}
