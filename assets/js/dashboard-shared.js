/* ══════════════════════════════════════════════
    SHARED UTILITIES — dipakai semua dashboard
══════════════════════════════════════════════ */

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

function executeLogout() {
  const token = localStorage.getItem('hris_token');
  
  // Hit API
  fetch('http://localhost:8000/api/logout', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
  }).finally(() => {
    localStorage.removeItem('hris_token');
    localStorage.removeItem('hris_user');
    window.location.href = '../../index.html';
  });
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
  SHARED DUMMY DATA
══════════════════════════════════════════════ */
var DATA = {
  divisions: ['Engineering','Design','Product','HR','Finance','Operations'],
  teams: ['Frontend','Backend','DevOps','QA','UI/UX','Data','People Ops','Growth'],

  staff: [
    { initials:'AR', name:'Alex Rivera',  color:'linear-gradient(135deg,#3d5c45,#6dbf80)', role:'Support Eng',   dept:'Engineering', team:'Backend',   level:'staff',      clockIn:'08:55 AM', clockIn2:'13:45 PM', clockOut:'17:05 PM', status:'complete', leaveLeft:12 },
    { initials:'SC', name:'Sam Chen',     color:'linear-gradient(135deg,#4a6080,#7a9abf)', role:'Data Analyst',  dept:'Engineering', team:'Data',      level:'staff',      clockIn:'09:15 AM', clockIn2:'14:10 PM', clockOut:'17:00 PM', status:'late',     leaveLeft:9  },
    { initials:'JL', name:'Jordan Lee',   color:'linear-gradient(135deg,#c0392b,#e07060)', role:'QA Tester',     dept:'Engineering', team:'QA',        level:'staff',      clockIn:'--:--',    clockIn2:'--:--',    clockOut:'--:--',    status:'pending',  leaveLeft:14 },
    { initials:'MP', name:'Maya Putri',   color:'linear-gradient(135deg,#7d5a9a,#b08bc0)', role:'UI Designer',   dept:'Design',      team:'UI/UX',     level:'team-lead',  clockIn:'08:48 AM', clockIn2:'13:50 PM', clockOut:'17:02 PM', status:'complete', leaveLeft:10 },
    { initials:'RW', name:'Ryan Wijaya',  color:'linear-gradient(135deg,#b07830,#d4a860)', role:'Backend Dev',   dept:'Engineering', team:'Backend',   level:'staff',      clockIn:'09:22 AM', clockIn2:'14:05 PM', clockOut:'17:10 PM', status:'late',     leaveLeft:7  },
    { initials:'DN', name:'Diana Nas',    color:'linear-gradient(135deg,#2980b9,#5dade2)', role:'Product Mgr',   dept:'Product',     team:'Growth',    level:'management', clockIn:'08:30 AM', clockIn2:'13:40 PM', clockOut:'17:00 PM', status:'complete', leaveLeft:11 },
    { initials:'BK', name:'Budi Kurnia',  color:'linear-gradient(135deg,#8e44ad,#bb8fce)', role:'DevOps',        dept:'Engineering', team:'DevOps',    level:'staff',      clockIn:'--:--',    clockIn2:'--:--',    clockOut:'--:--',    status:'pending',  leaveLeft:15 },
    { initials:'LS', name:'Lisa Santoso', color:'linear-gradient(135deg,#16a085,#48c9b0)', role:'HR Specialist', dept:'HR',          team:'People Ops',level:'staff',      clockIn:'09:05 AM', clockIn2:'14:00 PM', clockOut:'17:00 PM', status:'complete', leaveLeft:13 },
    { initials:'TK', name:'Toni Kusuma',  color:'linear-gradient(135deg,#e67e22,#f39c12)', role:'CFO',           dept:'Finance',     team:'Growth',    level:'c-level',    clockIn:'08:00 AM', clockIn2:'13:00 PM', clockOut:'17:00 PM', status:'complete', leaveLeft:20 },
    { initials:'FR', name:'Fina Rahma',   color:'linear-gradient(135deg,#c0392b,#e74c3c)', role:'Ops Manager',   dept:'Operations',  team:'Growth',    level:'management', clockIn:'08:20 AM', clockIn2:'13:30 PM', clockOut:'17:00 PM', status:'complete', leaveLeft:8  },
  ],

  // Karyawan yang ulang tahun bulan ini
  birthdays: [
    { initials:'SC', name:'Sam Chen',     color:'linear-gradient(135deg,#4a6080,#7a9abf)', role:'Data Analyst',  date:'Apr 21', dept:'Engineering' },
    { initials:'BK', name:'Budi Kurnia',  color:'linear-gradient(135deg,#8e44ad,#bb8fce)', role:'DevOps',        date:'Apr 25', dept:'Engineering' },
    { initials:'LS', name:'Lisa Santoso', color:'linear-gradient(135deg,#16a085,#48c9b0)', role:'HR Specialist', date:'Apr 30', dept:'HR'          },
  ],

  // Data cuti
  leaveRequests: [
    { initials:'JL', name:'Jordan Lee',  color:'linear-gradient(135deg,#c0392b,#e07060)', type:'Annual Leave', from:'Apr 21', to:'Apr 23', status:'approved' },
    { initials:'BK', name:'Budi Kurnia', color:'linear-gradient(135deg,#8e44ad,#bb8fce)', type:'Sick Leave',   from:'Apr 21', to:'Apr 21', status:'approved' },
    { initials:'MP', name:'Maya Putri',  color:'linear-gradient(135deg,#7d5a9a,#b08bc0)', type:'Annual Leave', from:'Apr 28', to:'Apr 30', status:'pending'  },
    { initials:'AR', name:'Alex Rivera', color:'linear-gradient(135deg,#3d5c45,#6dbf80)', type:'Annual Leave', from:'May 5',  to:'May 7',  status:'pending'  },
  ],

  // Riwayat absen 1 minggu — staff pribadi
  myWeek: [
    { date:'Mon, Apr 14', clockIn:'08:55 AM', clockIn2:'13:45 PM', clockOut:'17:05 PM', status:'complete' },
    { date:'Tue, Apr 15', clockIn:'09:02 AM', clockIn2:'14:10 PM', clockOut:'17:00 PM', status:'late'     },
    { date:'Wed, Apr 16', clockIn:'--:--',    clockIn2:'--:--',    clockOut:'--:--',    status:'leave'    },
    { date:'Thu, Apr 17', clockIn:'08:48 AM', clockIn2:'13:50 PM', clockOut:'17:10 PM', status:'complete' },
    { date:'Fri, Apr 18', clockIn:'08:59 AM', clockIn2:'14:00 PM', clockOut:'17:00 PM', status:'complete' },
  ],
};

/* ══════════════════════════════════════════════
  SHARED RENDER HELPERS
  NOTE: Semua tabel dibatasi MAX_ROWS baris.
  Saat integrasi backend, ganti DATA.xxx dengan
  response API dan tetap slice(0, MAX_ROWS).
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
  if (titleId) document.getElementById(titleId).textContent = 'Birthday This Month 🎂';
  var tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  // TODO backend: fetch('/api/birthdays?month=current&limit=' + MAX_ROWS)
  tbody.innerHTML = DATA.birthdays.map(function(p) {
    return '<tr><td>' + staffCell(p) + '</td><td class="att-date">' + p.dept + '</td><td class="checkin-time">' + p.date + '</td></tr>';
  }).join('');
}

/* ── Render leave table ── */
function renderLeave(tbodyId, titleId, rows) {
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

  var token = localStorage.getItem('hris_token');
  fetch('http://localhost:8000/api/leave/monthly', { 
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } 
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    var fetchedRows = data.data || data;
    if (!Array.isArray(fetchedRows)) fetchedRows = [];
    var tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    if (fetchedRows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:15px; color:#888;">-</td></tr>';
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
      var fromDate = p.start_date || p.from_date || p.from || '';
      var toDate = p.end_date || p.to_date || p.to || '';
      var status = p.status || 'pending';
      
      var formatD = function(dStr) {
        if (!dStr) return '';
        var d = new Date(dStr);
        if (isNaN(d)) return dStr;
        return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()] + ' ' + d.getDate();
      };
      var formattedFrom = formatD(fromDate);
      var formattedTo = formatD(toDate);
      var dateRange = formattedFrom;
      if (formattedTo && formattedTo !== formattedFrom) dateRange += ' – ' + formattedTo;
      if (!dateRange) dateRange = '-';

      return '<tr><td>' + staffCell(staffObj) + '</td><td class="att-date">' + type + '</td>' +
        '<td class="att-date">' + dateRange + '</td>' +
        '<td>' + leaveStatusBadge(status) + '</td></tr>';
    }).join('');
  })
  .catch(function(err) { console.error('Error fetching leave monthly:', err); });
}

/* ── Stat cards helper ── */
function setStatCard(id, value, sub) {
  var el = document.getElementById(id);
  if (!el) return;
  el.querySelector('.stat-value').textContent = value;
  if (sub !== undefined) el.querySelector('.stat-sub').textContent = sub;
}

/* ── Load Components ── */
window.loadComponents = function() {
  var p1 = fetch('../components/sidebar.html').then(r => r.text()).then(html => {
    var el = document.getElementById('sidebar-placeholder');
    if(el) el.outerHTML = html;
    var userStr = localStorage.getItem('hris_user');
    var userRole = '';
    if (userStr) {
      try {
        var userObj = JSON.parse(userStr);
        userRole = userObj.role || '';
      } catch(e) {}
    }
    
    if (userRole === 'staff') {
      document.querySelectorAll('.nav-reports, .nav-admin').forEach(e => e.style.display = 'none');
    } else if (userRole === 'team_leader') {
      document.querySelectorAll('.nav-reports').forEach(e => e.style.display = 'none');
    }
  });

  var p2 = fetch('../components/navbar.html').then(r => r.text()).then(html => {
    var el = document.getElementById('navbar-placeholder');
    if(el) el.outerHTML = html;

    // Inject Custom Logout Modal to Body
    if (!document.getElementById('logout-modal')) {
      var modalHTML = `
        <div id="logout-modal" class="modal-overlay">
          <div class="modal-content">
            <div class="modal-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </div>
            <h3>Log Out</h3>
            <p>Are you sure you want to log out? <br>Your active session will be ended.</p>
            <div class="modal-actions">
              <button class="btn-cancel" onclick="closeLogoutModal()">Cancel</button>
              <button class="btn-logout" onclick="executeLogout()">Log Out</button>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
  });
  return Promise.all([p1, p2]);
};

/* ══════════════════════════════════════════════
  API FETCH HELPERS — integrasi backend
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

function fetchAttendance(role, tbodyId) {
  var token = localStorage.getItem('hris_token');
  fetch('http://localhost:8000/api/attendance/today?role=' + role, {
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    var rows = data.data || data;
    if (!Array.isArray(rows)) rows = [];
    var tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:15px; color:#888;">-</td></tr>';
      return;
    }

    tbody.innerHTML = rows.slice(0, MAX_ROWS).map(function(p) {
      var name = p.user_name || p.name || 'Unknown';
      var rawRole = p.user_role || p.role || role;
      
      var staffObj = {
        initials: name.substring(0, 2).toUpperCase(),
        name: name,
        role: ROLE_MAP_SHARED[rawRole] || rawRole,
        color: 'linear-gradient(135deg,#3d5c45,#6dbf80)'
      };
      
      var clockIn = p.clock_in_time || p.clockIn || '--:--';
      var clockOut = p.clock_out_time || p.clockOut || '--:--';
      
      var s = p.status || 'pending';
      var sc = STATUS_MAP_SHARED[s] || { label: '● ' + s, c: '#5a6b78', bg: '#f0f2f5' };
      var stCell = '<td><span class="badge-status" style="color:'+sc.c+'; background:'+sc.bg+';">' + sc.label + '</span></td>';

      return '<tr><td>' + staffCell(staffObj) + '</td>' + timeCell(clockIn) + timeCell(clockOut) + stCell + '</tr>';
    }).join('');
  })
  .catch(function(err) { console.error('Error fetching ' + role + ' attendance:', err); });
}

function fetchCount(url, id) {
  var token = localStorage.getItem('hris_token');
  fetch(url, { headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } })
    .then(function(res) { return res.json(); })
    .then(function(resData) {
      var el = document.getElementById(id);
      if (!el) return;
      var val = 0;
      if (resData && resData.data && resData.data.total !== undefined) val = resData.data.total;
      else if (resData && resData.total !== undefined) val = resData.total;
      else val = resData.data || resData || 0;
      el.innerText = val;
    })
    .catch(function(err) { console.error('Error fetching count:', err); });
}

function fetchBirthdays(tbodyId) {
  var token = localStorage.getItem('hris_token');
  fetch('http://localhost:8000/api/users/birthdays', { 
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } 
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    var rows = data.data || data;
    if (!Array.isArray(rows)) rows = [];
    var tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:15px; color:#888;">-</td></tr>';
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
  })
  .catch(function(err) { console.error('Error fetching birthdays:', err); });
}
