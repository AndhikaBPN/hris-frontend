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
  if (el) el.textContent = name ? greet + ', ' + name + '.' : greet + '.';
  var de = document.getElementById('today-date');
  if (de) de.textContent = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
}

function getFirstName() {
  try {
    var u = JSON.parse(localStorage.getItem('hris_user') || '{}');
    return (u.name || '').split(' ')[0] || '';
  } catch (e) { return ''; }
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

/* ── Return data objects, not HTML ── */
function buildStaffCellData(p) {
  return {
    initials: p.initials,
    name: p.name,
    role: p.role,
    color: p.color
  };
}

function buildTimeCellData(val) {
  var empty = !val || val === '--:--';
  return {
    time: val || '--:--',
    isEmpty: empty
  };
}

function buildStatusCellData(s) {
  return {
    status: s,
    class: STATUS_CLASS[s] || 'approved',
    label: STATUS_LABEL[s] || s
  };
}

function buildLeaveStatusData(s) {
  return {
    class: s === 'approved' ? 'complete' : 'approved',
    label: s === 'approved' ? '● Approved' : '● Pending',
    status: s
  };
}

/* ── Render support (data only, HTML in page layer) ── */
function setTableTitle(titleId, text) {
  if (titleId) {
    var el = document.getElementById(titleId);
    if (el) el.textContent = text;
  }
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

/* ── Refactored: fetchAttendance now returns data only ── */
async function fetchAttendance(role) {
  var path = role === 'team'
    ? '/attendance/subordinates/today'
    : '/attendance/today?role=' + role;

  var result = await apiRequest(path);
  if (!result.success) {
    console.error('Error fetching ' + role + ' attendance:', result.error);
    return { success: false, data: [] };
  }

  var rows = extractListData(result);
  if (rows.length === 0) {
    return { success: true, data: [] };
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

    return { success: true, data: Object.values(grouped).slice(0, MAX_ROWS) };
  } else {
    var processed = rows.slice(0, MAX_ROWS).map(function(p) {
      var name = p.user_name || p.name || 'Unknown';
      var rawRole = p.user_role || p.role || role;
      var clockIn = p.clock_in_time || p.check_in_time || p.clockIn || '--:--';
      var clockOut = p.clock_out_time || p.check_out_time || p.clockOut || '--:--';

      if (clockIn.includes(' ')) clockIn = clockIn.split(' ')[1].substring(0, 5);
      if (clockOut.includes(' ')) clockOut = clockOut.split(' ')[1].substring(0, 5);

      return {
        name: name,
        role: ROLE_MAP_SHARED[rawRole] || rawRole,
        clockIn: clockIn,
        clockOut: clockOut,
        status: p.status || 'pending'
      };
    });

    return { success: true, data: processed };
  }
}

/* ── Refactored: Return data only, no DOM manipulation ── */
async function fetchCount(path) {
  var result = await apiRequest(path);
  if (!result.success) {
    console.error('Error fetching count:', result.error);
    return { success: false, data: 0 };
  }

  var d = extractSingleData(result) || {};
  var val = (d.total !== undefined) ? d.total : 0;
  return { success: true, data: val };
}

async function fetchBirthdays() {
  var result = await apiRequest('/users/birthdays');
  if (!result.success) {
    console.error('Error fetching birthdays:', result.error);
    return { success: false, data: [] };
  }

  var rows = extractListData(result);
  if (rows.length === 0) {
    return { success: true, data: [] };
  }

  var processed = rows.slice(0, MAX_ROWS).map(function(p) {
    var name = p.name || 'Unknown';
    var rawRole = p.role || '';
    var dob = p.birth_date || '';
    var formattedDate = dob;
    if (dob) {
      var d = new Date(dob);
      if (!isNaN(d)) {
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        formattedDate = months[d.getMonth()] + ' ' + d.getDate();
      }
    }
    var dept = p.team_name || (p.team_id ? 'Team ' + p.team_id : '-');

    return {
      name: name,
      role: ROLE_MAP_SHARED[rawRole] || rawRole,
      department: dept,
      birthDate: formattedDate
    };
  });

  return { success: true, data: processed };
}

async function fetchLeaveQuota() {
  var result = await apiRequest('/leave/quota');
  if (!result.success) {
    console.error('Error fetching leave quota:', result.error);
    return { success: false, data: {} };
  }

  var qData = extractSingleData(result) || {};
  return { success: true, data: qData };
}
