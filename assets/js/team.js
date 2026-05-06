/* ══════════════════════════════════════════════
  TEAM JS
══════════════════════════════════════════════ */

/* ── FETCH TEAMS ── */
function fetchTeams(options) {
  options = options || {};
  var page = options.page || 1;
  var limit = options.limit || 50;
  var orderBy = options.order_by || 'id';
  var sorting = options.sorting || 'asc';
  var callback = options.callback || function() {};
  var errorCallback = options.errorCallback || function() {};

  var params = '?page=' + page + '&limit=' + limit + '&order_by=' + orderBy + '&sorting=' + sorting;

  apiRequest('/teams' + params)
    .then(function(res) {
      var data = res.data || [];
      var meta = res.meta || {};
      callback({
        success: true,
        data: data,
        meta: meta
      });
    })
    .catch(function(err) {
      console.error('Error fetching teams:', err);
      errorCallback({
        success: false,
        error: err.message || 'Failed to fetch teams'
      });
    });
}

/* ── GET ALL TEAMS ── */
function getAllTeams(callback) {
  fetchTeams({
    page: 1,
    limit: 1000,
    order_by: 'id',
    sorting: 'asc',
    callback: callback,
    errorCallback: function(err) {
      console.error('Error fetching all teams:', err);
      if (callback) callback({ success: false, data: [], error: err.error });
    }
  });
}
