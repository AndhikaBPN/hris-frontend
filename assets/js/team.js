/* ══════════════════════════════════════════════
  TEAM JS
══════════════════════════════════════════════ */

/* ── FETCH TEAMS ── */
async function fetchTeams(options) {
  options = options || {};
  var page = options.page || 1;
  var limit = options.limit || 50;
  var orderBy = options.order_by || 'id';
  var sorting = options.sorting || 'asc';

  var params = '?page=' + page + '&limit=' + limit + '&order_by=' + orderBy + '&sorting=' + sorting;
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

/* ── GET ALL TEAMS ── */
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

/* ── FETCH TEAM LEADERS ── */
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

/* ── GET ALL TEAM LEADERS ── */
async function getAllTeamLeaders(options) {
  options = options || {};
  var limit = options.limit || 50;
  return await fetchTeamLeaders({
    page: 1,
    limit: limit
  });
}

/* ── CREATE TEAM ── */
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

/* ══ ROLE CONFIG ══ */
var user = JSON.parse(localStorage.getItem('hris_user') || '{}');
var CURRENT_ROLE = user.role || 'staff';
var CAN_MANAGE   = (CURRENT_ROLE === 'hrd_manager' || CURRENT_ROLE === 'technical_manager' || CURRENT_ROLE === 'c_level');

/* ══ TEAM DATA ══ */
var TEAMS = [];

/* ── COLOR PALETTE & HELPERS ── */
var COLORS = [
  { bg: '#e8f5ec', text: '#3d5c45' },
  { bg: '#f0eafb', text: '#7d5a9a' },
  { bg: '#e6f0fb', text: '#2980b9' },
  { bg: '#fff4e5', text: '#b06000' },
  { bg: '#fdecea', text: '#c0392b' }
];

function getColorByIndex(idx) {
  return COLORS[idx % COLORS.length];
}

function getInitials(name) {
  if (!name) return '';
  var parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + (parts[parts.length - 1][0] || '')).toUpperCase();
}

function mapTeamData(teams) {
  return teams.map(function(t, idx) {
    var color = getColorByIndex(idx);
    var initials = getInitials(t.team_lead_name);
    return {
      id: t.id,
      name: t.team_name || '',
      division: '',
      leadName: t.team_lead_name || '',
      leadInitials: initials,
      leadColor: 'linear-gradient(135deg,' + color.bg + ',' + color.text + ')',
      leadRole: '',
      members: '',
      function: '',
      iconBg: color.bg,
      iconColor: color.text,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
      retention: '',
      perf: '',
      growth: '',
      desc: ''
    };
  });
}

/* ══ LIST PAGE ══ */
var currentPage   = 1;
var filteredTeams = TEAMS.slice();

function filterTeams() {
  var q     = (document.getElementById('search-input') || {}).value || '';
  var limit = parseInt((document.getElementById('limit-select') || {}).value || 10);
  filteredTeams = TEAMS.filter(function(t) {
    return t.name.toLowerCase().includes(q.toLowerCase()) ||
           t.division.toLowerCase().includes(q.toLowerCase()) ||
           t.leadName.toLowerCase().includes(q.toLowerCase());
  });
  currentPage = 1;
  renderList(limit);
}

async function onLimitChange() {
  var limit = parseInt((document.getElementById('limit-select') || {}).value || 10);
  var res = await getAllTeams({ limit: limit });
  if (res.success && res.data && res.data.length > 0) {
    TEAMS = mapTeamData(res.data);
    filterTeams();
  }
}

function changePage(dir) {
  var limit   = parseInt(document.getElementById('limit-select').value);
  var maxPage = Math.ceil(filteredTeams.length / limit) || 1;
  currentPage = Math.max(1, Math.min(maxPage, currentPage + dir));
  renderList(limit);
}

function renderList(limit) {
  var total   = filteredTeams.length;
  var maxPage = Math.ceil(total / limit) || 1;
  var start   = (currentPage - 1) * limit;
  var end     = Math.min(start + limit, total);
  var visible = filteredTeams.slice(start, end);

  var html = visible.map(function(t) {
    var actions = CAN_MANAGE ? '<div class="team-actions"><div style="display:flex;gap:6px;">' +
        '<button class="btn-mem-edit" onclick="event.preventDefault();event.stopPropagation();alert(\'Edit: ' + t.name + '\')">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
          ' Edit</button>' +
        '<button class="btn-mem-delete" onclick="event.preventDefault();event.stopPropagation();deleteTeam(' + t.id + ',\'' + t.name + '\')">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>' +
          ' Hapus</button>' +
      '</div></div>' : '';
    return '<a class="team-row' + (CAN_MANAGE ? '' : ' team-row--no-actions') + '" href="team-detail.html?id=' + t.id + '">' +
      '<div class="team-name-cell"><div class="team-icon" style="background:' + t.iconBg + ';color:' + t.iconColor + ';">' + t.icon + '</div><div><div class="team-name-text">' + t.name + '</div><div class="team-name-sub">' + t.division + '</div></div></div>' +
      '<div class="team-lead-cell"><div class="staff-avatar" style="width:28px;height:28px;font-size:10px;background:' + t.leadColor + ';">' + t.leadInitials + '</div><span class="team-lead-name">' + t.leadName + '</span></div>' +
      '<div><span class="members-badge">' + t.members + ' Players</span></div>' +
      '<div class="team-function">' + t.function + '</div>' +
      actions +
    '</a>';
  }).join('');

  var el = document.getElementById('team-list');
  if (el) el.innerHTML = html || '<div class="team-empty">Tidak ada tim ditemukan</div>';

  var info = document.getElementById('pag-info');
  if (info) info.textContent = 'Showing ' + (start+1) + '-' + end + ' of ' + total + ' teams';
  var prev = document.getElementById('pag-prev');
  var next = document.getElementById('pag-next');
  if (prev) prev.disabled = currentPage <= 1;
  if (next) next.disabled = currentPage >= maxPage;
}

function deleteTeam(id, name) {
  if (confirm('Hapus tim "' + name + '"?')) {
    TEAMS = TEAMS.filter(function(t) { return t.id !== id; });
    filterTeams();
  }
}

async function openCreateModal() {
  await populateTeamLeadDropdown();
  document.getElementById('create-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCreateModal() { document.getElementById('create-modal').classList.remove('open'); document.body.style.overflow=''; }

function openSuccessModal(message) {
  var msgEl = document.getElementById('success-message');
  if (msgEl) msgEl.textContent = message;
  document.getElementById('success-modal').classList.add('open');
  document.body.style.overflow = 'hidden';

  setTimeout(function() {
    closeSuccessModal();
  }, 2000);
}

function closeSuccessModal() {
  document.getElementById('success-modal').classList.remove('open');
  document.body.style.overflow = '';
  location.reload();
}
async function submitCreateTeam() {
  var name = (document.getElementById('f-name')||{}).value || '';
  var lead = (document.getElementById('f-lead')||{}).value || '';
  var err  = document.getElementById('form-error');

  if (!name.trim() || !lead) {
    if (err) { err.textContent='Please fill in all required fields (*)'; err.style.display='block'; }
    return;
  }

  if (err) err.style.display='none';

  var result = await createTeam({
    team_name: name,
    team_lead_id: parseInt(lead)
  });

  if (result.success) {
    closeCreateModal();
    document.getElementById('f-name').value = '';
    document.getElementById('f-lead').value = '';
    openSuccessModal(result.message);
  } else {
    if (err) { err.textContent=result.message; err.style.display='block'; }
  }
}

/* ══ SHARED UTILS ══ */
function setActive(el) { document.querySelectorAll('.nav-item').forEach(function(n){n.classList.remove('active');}); el.classList.add('active'); }

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeCreateModal();
    if (typeof closeEditModal === 'function') closeEditModal();
  }
});

/* ══ POPULATE TEAM LEAD DROPDOWN ── */
async function populateTeamLeadDropdown() {
  var res = await getAllTeamLeaders({ limit: 50 });
  if (res.success && res.data && res.data.length > 0) {
    var select = document.getElementById('f-lead');
    if (select) {
      var firstOption = select.querySelector('option');
      select.innerHTML = '';
      if (firstOption) select.appendChild(firstOption);

      res.data.forEach(function(lead) {
        var opt = document.createElement('option');
        opt.value = lead.id;
        opt.textContent = lead.name;
        select.appendChild(opt);
      });
    }
  }
}

/* ══ INIT ══ */
window.addEventListener('load', async function() {
  var btn = document.getElementById('btn-create');
  if (btn && CAN_MANAGE) btn.style.display = 'inline-flex';

  var tableHead = document.querySelector('.team-table-head');
  if (tableHead && !CAN_MANAGE) {
    var actions = tableHead.querySelector('div:last-child');
    if (actions && actions.textContent === 'ACTIONS') actions.remove();
    tableHead.style.gridTemplateColumns = '2fr 1.5fr 0.8fr 1.2fr';
  }

  if (document.getElementById('team-list')) {
    var res = await getAllTeams({ limit: 100 });
    if (res.success && res.data && res.data.length > 0) {
      TEAMS = mapTeamData(res.data);
      filterTeams();
    } else {
      console.error('Failed to load teams:', res.error);
      document.getElementById('team-list').innerHTML = '<div class="team-empty">Gagal memuat data tim</div>';
    }
  }
});
