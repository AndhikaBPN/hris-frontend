/* ══════════════════════════════════════════════
    SHARED UTILITIES — used by all dashboards
    ══════════════════════════════════════════════ */

/* ── Route Guard ── */
var ROLE_DASHBOARD_MAP = {
  'c_level':           'dashboard-clevel.html',
  'hrd_manager':       'dashboard-manager.html',
  'technical_manager': 'dashboard-manager.html',
  'team_leader':       'dashboard-teamlead.html',
  'staff':             'dashboard-staff.html'
};

function guardRoute(allowedRoles) {
  var userStr = localStorage.getItem('hris_user');
  var token   = localStorage.getItem('hris_token');

  if (!userStr || !token) {
    // If we are in pages/xxx/, index.html is at ../../index.html
    window.location.replace('../../index.html');
    return;
  }

  var userRole = '';
  try { userRole = JSON.parse(userStr).role || ''; } catch(e) {}

  if (allowedRoles.indexOf(userRole) === -1) {
    var target = ROLE_DASHBOARD_MAP[userRole];
    if (target) {
      // All dashboards are in ../dashboard/ relative to pages/attendance/
      // or same directory if already in pages/dashboard/
      const currentPath = window.location.pathname;
      if (currentPath.includes('/attendance/')) {
        window.location.replace('../dashboard/' + target);
      } else {
        window.location.replace(target);
      }
    } else {
      window.location.replace('../../index.html');
    }
  }
}

/* ── Live clock ── */
function updateLiveClock() {
  var el = document.getElementById('live-clock');
  if (!el) return;
  var now = new Date(), h = now.getHours(), m = now.getMinutes().toString().padStart(2,'0');
  var ampm = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  el.textContent = h.toString().padStart(2,'0') + ':' + m + ' ' + ampm;
}

/* ── Biometric switch ── */
function activateBiometric() {
  document.getElementById('state-pre').style.display = 'none';
  document.getElementById('state-active').style.display = 'flex';
}
function deactivateBiometric() {
  document.getElementById('state-active').style.display = 'none';
  document.getElementById('state-pre').style.display = 'flex';
}

/* ── Clock session ── */
function clockSession(num) {
  var msg = document.getElementById('session-msg');
  var now = new Date();
  var time = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
  msg.textContent = '✓  Session ' + num + ' clocked in at ' + time;
  msg.style.color = '#2e7d4f';
  var btns = document.querySelectorAll('.btn-session');
  if (btns[num - 1]) {
    btns[num - 1].textContent = '✓ Clocked In ' + time;
    btns[num - 1].disabled = true;
    btns[num - 1].style.opacity = '0.7';
  }
}

/* ── Clock out ── */
function clockOut() {
  var msg = document.getElementById('session-msg');
  var now = new Date();
  var time = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
  msg.textContent = '✓  Clocked out at ' + time;
  msg.style.color = '#c0392b';
  var btn = document.getElementById('btn-clockout');
  if (btn) { btn.textContent = '✓ Clocked Out ' + time; btn.disabled = true; btn.style.opacity = '0.7'; }
}

/* ── Nav active ── */
function setActive(el) {
  document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
  el.classList.add('active');
}

/* ── Logout ── */
function handleLogout() {
  var modal = document.getElementById('logout-modal');
  if (modal) {
    modal.style.display = 'flex';
  } else {
    // Fallback if modal not injected yet
    if (confirm('Are you sure you want to logout?')) { executeLogout(); }
  }
}

function closeLogoutModal() {
  var modal = document.getElementById('logout-modal');
  if (modal) modal.style.display = 'none';
}

async function executeLogout() {
  await apiRequest('/logout', { method: 'POST' });
  localStorage.removeItem('hris_token');
  localStorage.removeItem('hris_user');
  window.location.href = '../../index.html';
}

/* ── Date & greeting ── */
function initDateGreeting(name) {
  var h = new Date().getHours();
  var greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  var el = document.getElementById('greeting-text');
  if (el) el.textContent = greet + ', ' + name + '.';
  var de = document.getElementById('today-date');
  if (de) de.textContent = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
}

/* ── Progress bar animate ── */
function animateProgress(pct) {
  var fill = document.querySelector('.progress-fill');
  if (fill) { fill.style.width = '0%'; setTimeout(function() { fill.style.width = pct + '%'; }, 300); }
}

/* ══════════════════════════════════════════════
  SHARED DATA — DEPRECATED (Moved to API)
══════════════════════════════════════════════ */
var DATA = { staff: [], birthdays: [], leaveRequests: [], myWeek: [] };


/* ══════════════════════════════════════════════
  SHARED RENDER HELPERS
  NOTE: All tables are limited to MAX_ROWS.
  When integrating backend, replace DATA.xxx with
  API response and keep slice(0, MAX_ROWS).
══════════════════════════════════════════════ */
var MAX_ROWS = 5;

var STATUS_CLASS = { complete:'complete', late:'late', pending:'approved', leave:'approved' };
var STATUS_LABEL = { complete:'● Complete', late:'● Late Entry', pending:'● Pending', leave:'● On Leave' };

function staffCell(p) {
  return '<div class="staff-cell"><div class="staff-avatar" style="background:' + p.color + ';">' + p.initials + '</div>' +
    '<div><span class="staff-name">' + p.name + '</span><div class="staff-role">' + p.role + '</div></div></div>';
}

function timeCell(val) {
  var empty = !val || val === '--:--';
  return '<td class="checkin-time' + (empty ? ' pending-time' : '') + '">' + (val || '--:--') + '</td>';
}

function statusCell(s) {
  return '<td><span class="badge-status ' + (STATUS_CLASS[s]||'approved') + '">' + (STATUS_LABEL[s]||s) + '</span></td>';
}

function leaveStatusBadge(s) {
  var cls = s === 'approved' ? 'complete' : 'approved';
  var lbl = s === 'approved' ? '● Approved' : '● Pending';
  return '<span class="badge-status ' + cls + '">' + lbl + '</span>';
}

/* ── Render attendance table (generic) ── */
function renderAttTable(tbodyId, rows, rowFn) {
  var tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  // TODO backend: ganti rows dengan data dari API endpoint
  tbody.innerHTML = rows.map(rowFn).join('');
}

/* ── Render birthday table ── */
function renderBirthdays(tbodyId, titleId) {
  if (titleId) {
    var titleEl = document.getElementById(titleId);
    if(titleEl) titleEl.textContent = 'Birthdays This Month 🎂';
  }
  fetchBirthdays(tbodyId);
}

/* ── Render leave table ── */
async function renderLeave(tbodyId, titleId, rows) {
  if (titleId) {
    var titleEl = document.getElementById(titleId);
    if(titleEl) titleEl.textContent = 'Leave Requests';
  }

  if (rows) {
    var tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    tbody.innerHTML = rows.map(function(p) {
      return '<tr><td>' + staffCell(p) + '</td><td class="att-date">' + p.type + '</td>' +
        '<td class="att-date">' + p.from + ' – ' + p.to + '</td>' +
        '<td>' + leaveStatusBadge(p.status) + '</td></tr>';
    }).join('');
    return;
  }

  var result = await apiRequest('/leave/monthly');
  var fetchedRows = extractListData(result);
  var tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  if (fetchedRows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:15px; color:#888;">No Data</td></tr>';
    return;
  }

  tbody.innerHTML = fetchedRows.slice(0, MAX_ROWS).map(function(p) {
    var name = p.user_name || p.name || 'Unknown';
    var rawRole = p.user_role || p.role || '';
    var staffObj = {
      initials: name.substring(0, 2).toUpperCase(),
      name: name,
      role: ROLE_MAP_SHARED[rawRole] || rawRole,
      color: 'linear-gradient(135deg,#7d5a9a,#b08bc0)'
    };

    var type = p.leave_type || p.type || '-';
    var fromDate = p.leave_date_from || p.start_date || p.from_date || p.from || '';
    var toDate   = p.leave_date_to   || p.end_date   || p.to_date   || p.to   || '';
    var status = p.status || 'pending';

    var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var formatD = function(dStr) {
      if (!dStr) return '';
      var d = new Date(dStr.replace(' ', 'T').split('T')[0] + 'T00:00:00Z');
      if (isNaN(d)) return dStr;
      return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
    };
    var formattedFrom = formatD(fromDate);
    var formattedTo   = formatD(toDate);
    var dateRange = formattedFrom && formattedTo && formattedFrom !== formattedTo
      ? formattedFrom + ' – ' + formattedTo
      : (formattedFrom || formattedTo || '-');

    return '<tr><td>' + staffCell(staffObj) + '</td><td class="att-date">' + type + '</td>' +
      '<td class="att-date">' + dateRange + '</td>' +
      '<td>' + leaveStatusBadge(status) + '</td></tr>';
  }).join('');

  if (!result.success) console.error('Error fetching leave monthly:', result.error);
}

/* ── Stat cards helper ── */
function setStatCard(id, value, sub) {
  var el = document.getElementById(id);
  if (!el) return;
  el.querySelector('.stat-value').textContent = value;
  if (sub !== undefined) el.querySelector('.stat-sub').textContent = sub;
}


/* ══════════════════════════════════════════════
  API FETCH HELPERS — backend integration
══════════════════════════════════════════════ */

var ROLE_MAP_SHARED = { 
  'hrd_manager': 'HRD Manager', 
  'technical_manager': 'Technical Manager', 
  'team_leader': 'Team Lead', 
  'staff': 'Staff' 
};

var STATUS_MAP_SHARED = {
  'valid': { label: '● Valid', c: '#2e7d4f', bg: '#e8f5ec' },
  'late': { label: '● Late', c: '#b06000', bg: '#fff4e5' },
  'invalid': { label: '● Invalid', c: '#c0392b', bg: '#fdecea' },
  'leave': { label: '● Leave', c: '#2980b9', bg: '#e8f0fc' },
  'sick-leave': { label: '● Sick Leave', c: '#2980b9', bg: '#e8f0fc' },
  'permit': { label: '● Permit', c: '#2980b9', bg: '#e8f0fc' }
};

async function fetchAttendance(role, tbodyId) {
  var path = role === 'team'
    ? '/attendance/subordinates/today'
    : '/attendance/today?role=' + role;

  var result = await apiRequest(path);
  var rows = extractListData(result);
  var tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:15px; color:#888;">No Data</td></tr>';
    return;
  }

  if (role === 'team') {
    var grouped = {};
    rows.forEach(function(p) {
      var uid = p.user_id;
      if (!grouped[uid]) {
        grouped[uid] = {
          name: p.user_name || p.name,
          role: p.user_role || p.role,
          c1: '--:--', c2: '--:--', status: p.status
        };
      }
      var time = p.check_in_time || p.clock_in_time;
      if (time && time.includes(' ')) time = time.split(' ')[1].substring(0, 5);

      if (p.session == 1) grouped[uid].c1 = time;
      else if (p.session == 2) grouped[uid].c2 = time;
    });

    var finalRows = Object.values(grouped);
    tbody.innerHTML = finalRows.slice(0, MAX_ROWS).map(function(u) {
      var staffObj = {
        initials: u.name.substring(0, 2).toUpperCase(),
        name: u.name,
        role: ROLE_MAP_SHARED[u.role] || u.role,
        color: 'linear-gradient(135deg,#3d5c45,#6dbf80)'
      };
      var sc = STATUS_MAP_SHARED[u.status] || { label: '● ' + u.status, c: '#5a6b78', bg: '#f0f2f5' };
      var stCell = '<td><span class="badge-status" style="color:'+sc.c+'; background:'+sc.bg+';">' + sc.label + '</span></td>';
      return '<tr><td>' + staffCell(staffObj) + '</td>' + timeCell(u.c1) + timeCell(u.c2) + stCell + '</tr>';
    }).join('');
  } else {
    tbody.innerHTML = rows.slice(0, MAX_ROWS).map(function(p) {
      var name = p.user_name || p.name || 'Unknown';
      var rawRole = p.user_role || p.role || role;
      var staffObj = {
        initials: name.substring(0, 2).toUpperCase(),
        name: name,
        role: ROLE_MAP_SHARED[rawRole] || rawRole,
        color: 'linear-gradient(135deg,#3d5c45,#6dbf80)'
      };

      var clockIn = p.clock_in_time || p.check_in_time || p.clockIn || '--:--';
      var clockOut = p.clock_out_time || p.check_out_time || p.clockOut || '--:--';

      if (clockIn.includes(' ')) clockIn = clockIn.split(' ')[1].substring(0, 5);
      if (clockOut.includes(' ')) clockOut = clockOut.split(' ')[1].substring(0, 5);

      var s = p.status || 'pending';
      var sc = STATUS_MAP_SHARED[s] || { label: '● ' + s, c: '#5a6b78', bg: '#f0f2f5' };
      var stCell = '<td><span class="badge-status" style="color:'+sc.c+'; background:'+sc.bg+';">' + sc.label + '</span></td>';
      return '<tr><td>' + staffCell(staffObj) + '</td>' + timeCell(clockIn) + timeCell(clockOut) + stCell + '</tr>';
    }).join('');
  }

  if (!result.success) console.error('Error fetching ' + role + ' attendance:', result.error);
}

async function fetchCount(path, id) {
  var result = await apiRequest(path);
  if (!result.success) {
    console.error('Error fetching count:', result.error);
    return;
  }

  var el = document.getElementById(id);
  if (!el) return;
  var d = extractSingleData(result) || {};
  var val = (d.total !== undefined) ? d.total : 0;
  el.innerText = val;
}

async function fetchBirthdays(tbodyId) {
  var result = await apiRequest('/users/birthdays');
  var rows = extractListData(result);
  var tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:15px; color:#888;">No Data</td></tr>';
    return;
  }

  tbody.innerHTML = rows.slice(0, MAX_ROWS).map(function(p) {
    var name = p.name || 'Unknown';
    var rawRole = p.role || '';
    var staffObj = {
      initials: name.substring(0, 2).toUpperCase(),
      name: name,
      role: ROLE_MAP_SHARED[rawRole] || rawRole,
      color: 'linear-gradient(135deg,#8e44ad,#bb8fce)'
    };
    var dob = p.birth_date || '';
    var formattedDate = dob;
    if (dob) {
      var d = new Date(dob);
      if (!isNaN(d)) formattedDate = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()] + ' ' + d.getDate();
    }
    var dept = p.team_name || (p.team_id ? 'Team ' + p.team_id : '-');
    return '<tr><td>' + staffCell(staffObj) + '</td><td class="att-date">' + dept + '</td><td class="checkin-time">' + formattedDate + '</td></tr>';
  }).join('');

  if (!result.success) console.error('Error fetching birthdays:', result.error);
}

async function fetchLeaveQuota(id) {
  var result = await apiRequest('/leave/quota');
  var el = document.getElementById(id);
  if (!el) return;
  if (result.success) {
    var qData = extractSingleData(result) || {};
    el.textContent = qData.remaining_quota !== undefined ? qData.remaining_quota : 0;
  } else {
    console.error('Error fetching leave quota:', result.error);
  }
}
