/* ══════════════════════════════════════════════
   ATTENDANCE MANAGER JS
══════════════════════════════════════════════ */

/* ── Shared utils ── */
function setActive(el) {
  document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
  el.classList.add('active');
}
function exportReport() { alert('Report exported successfully! File will download.'); }

/* ══ SUMMARY STRIP ══ */
function fetchAttendanceSummary(month) {
  var token = localStorage.getItem('hris_token');
  var url = 'http://localhost:8000/api/attendance/summary?month=' + month;

  fetch(url, {
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    var rows = data.data || [];
    if (!Array.isArray(rows)) rows = [];

    var hadir = 0, late = 0, absent = 0, cuti = 0, rates = [];
    rows.forEach(function(r) {
      hadir += r.total_valid || 0;
      late += r.total_late || 0;
      absent += r.total_invalid || 0;
      cuti += r.total_leave || 0;
      if (r.rate !== undefined) rates.push(r.rate);
    });

    var avgRate = rates.length > 0 ? Math.round(rates.reduce(function(a, b) { return a + b; }, 0) / rates.length) : 0;

    document.getElementById('sum-hadir').textContent = hadir;
    document.getElementById('sum-late').textContent = late;
    document.getElementById('sum-absent').textContent = absent;
    document.getElementById('sum-cuti').textContent = cuti;
    document.getElementById('sum-rate').textContent = avgRate + '%';

    renderSummaryTableFromAPI(rows);
  })
  .catch(function(err) { console.error('Error fetching attendance summary:', err); });
}

function renderSummaryTableFromAPI(rows) {
  var html = rows.map(function(r) {
    var total = r.total_valid + r.total_late + r.total_invalid + r.total_leave;
    var rate = total > 0 ? Math.round((r.total_valid / total) * 100) : 0;
    var barColor = rate >= 90 ? '#2e7d4f' : rate >= 70 ? '#f39c12' : '#c0392b';
    var avatarObj = {
      initials: (r.user_name || 'U').substring(0, 2).toUpperCase(),
      name: r.user_name || 'Unknown',
      role: ROLE_MAP_SHARED[r.user_role || ''] || (r.user_role || ''),
      color: 'linear-gradient(135deg,#3d5c45,#6dbf80)'
    };
    return '<tr>' +
      '<td>' + staffCell(avatarObj) + '</td>' +
      '<td class="checkin-time">' + total + '</td>' +
      '<td class="checkin-time">' + r.total_valid + '</td>' +
      '<td class="checkin-time">' + (r.total_late  ? '<span style="color:#b06000;font-weight:500;">' + r.total_late  + '</span>' : '0') + '</td>' +
      '<td class="checkin-time">' + (r.total_invalid? '<span style="color:#c0392b;font-weight:500;">' + r.total_invalid + '</span>' : '0') + '</td>' +
      '<td class="checkin-time">' + r.total_leave + '</td>' +
      '<td><div class="rate-bar-wrap">' +
        '<div class="rate-bar"><div class="rate-bar-fill" style="width:' + rate + '%;background:' + barColor + ';"></div></div>' +
        '<span class="rate-pct">' + rate + '%</span>' +
      '</div></td>' +
    '</tr>';
  }).join('');
  document.getElementById('summary-tbody').innerHTML = html;
}

/* ══ CALENDAR ══ */
var calYear   = 2023;
var calMonth  = 9; // October
var calView   = 'team'; // 'team' | 'me'
var selectedCalDay = null;

function switchCalView(view) {
  calView = view;
  document.getElementById('btn-view-team').classList.toggle('active', view === 'team');
  document.getElementById('btn-view-me').classList.toggle('active', view === 'me');
  renderCalLegend();
  renderCalendar();
}

function renderCalLegend() {
  var el = document.getElementById('cal-legend-row');
  if (calView === 'team') {
    el.innerHTML =
      '<div class="cal-legend-item"><span class="cal-legend-dot dot-high"></span> ≥90% present</div>' +
      '<div class="cal-legend-item"><span class="cal-legend-dot dot-medium"></span> 70–89%</div>' +
      '<div class="cal-legend-item"><span class="cal-legend-dot dot-low"></span> &lt;70%</div>' +
      '<div class="cal-legend-item"><span class="cal-legend-dot dot-nodata"></span> No data</div>';
  } else {
    el.innerHTML =
      '<div class="cal-legend-item"><span class="cal-legend-dot dot-shift-morning"></span> Morning</div>' +
      '<div class="cal-legend-item"><span class="cal-legend-dot dot-shift-evening"></span> Evening</div>' +
      '<div class="cal-legend-item"><span class="cal-legend-dot dot-shift-night"></span> Night</div>' +
      '<div class="cal-legend-item"><span class="cal-legend-dot dot-shift-dayoff"></span> Day Off</div>';
  }
}

function pctDotColor(pct) {
  if (pct === undefined) return '#dde3ea';
  if (pct >= 90) return '#2e7d4f';
  if (pct >= 70) return '#f39c12';
  return '#c0392b';
}

function changeMonth(dir) {
  calMonth += dir;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0)  { calMonth = 11; calYear--; }
  selectedCalDay = null;
  renderCalendar();
}

function renderCalendar() {
  var MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
  document.getElementById('cal-month-label').textContent = MONTHS[calMonth] + ' ' + calYear;

  var firstDay  = new Date(calYear, calMonth, 1).getDay();
  var daysInMon = new Date(calYear, calMonth + 1, 0).getDate();
  var today     = new Date();

  var html = '';
  for (var i = 0; i < firstDay; i++) html += '<div class="cal-cell empty"></div>';

  for (var d = 1; d <= daysInMon; d++) {
    var isToday = calYear === today.getFullYear() && calMonth === today.getMonth() && d === today.getDate();
    var isSel   = selectedCalDay === d;
    var isSat   = new Date(calYear, calMonth, d).getDay() === 6;
    var cls     = 'cal-cell'
      + (isToday ? ' today'    : '')
      + (isSel   ? ' selected' : '')
      + (isSat   ? ' sat'      : '');

    var dotHtml = '';
    if (calView === 'team') {
      var pct  = teamAttPct[d];
      var col  = pctDotColor(pct);
      var tip  = pct !== undefined ? pct + '% present' : 'No data';
      dotHtml  = '<span class="att-pct-dot" style="background:' + col + ';" title="' + tip + '"></span>';
    } else {
      var shift = myShifts[d] || 'none';
      var dotColMap = { morning:'#3d5c45', evening:'#2980b9', night:'#7d5a9a', dayoff:'transparent' };
      var dotBdr = shift === 'dayoff' ? 'border:1.5px solid #c5cdd5;' : '';
      dotHtml = shift !== 'none'
        ? '<span class="att-pct-dot" style="background:' + (dotColMap[shift]||'#dde3ea') + ';' + dotBdr + '"></span>'
        : '';
    }

    html += '<div class="' + cls + '" onclick="onCalClick(' + d + ')">'
          +   '<span>' + d + '</span>'
          +   dotHtml
          + '</div>';
  }
  document.getElementById('cal-body').innerHTML = html;
}

function onCalClick(day) {
  if (selectedCalDay === day) {
    selectedCalDay = null;
    dpPickedDate   = null;
    dpPickedYear   = dpYear;
    dpPickedMonth  = dpMonth;
    document.getElementById('date-picker-label').textContent = 'Select Date';
    document.getElementById('btn-date-picker').classList.remove('open');
  } else {
    selectedCalDay = day;
    /* Sync date picker */
    var MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var dNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var dName  = dNames[new Date(calYear, calMonth, day).getDay()];
    var lbl    = dName + ', ' + day + ' ' + MONTHS_SHORT[calMonth];
    document.getElementById('date-picker-label').textContent = lbl;
    document.getElementById('btn-date-picker').classList.add('open');
    dpPickedDate  = day;
    dpPickedYear  = calYear;
    dpPickedMonth = calMonth;
    dpYear  = calYear;
    dpMonth = calMonth;
    renderDpCalendar();
  }
  renderCalendar();
  fetchTeamAttendance();
}

/* ══ TEAM TABLE ══ */
var teamCurrentPage = 1;
var teamLimit = 5;

function fetchTeamAttendance(page) {
  if (page !== undefined) teamCurrentPage = page;

  var pad = function(n) { return n.toString().padStart(2, '0'); };
  var today = new Date();
  var todayStr = today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate());

  var dateFrom = document.getElementById('filter-team-from').value || todayStr;
  var dateTo   = document.getElementById('filter-team-to').value   || todayStr;

  var filterStatus = document.getElementById('filter-team-status').value;
  var params = '?view=staff&page=' + teamCurrentPage + '&limit=' + teamLimit +
    '&date_from=' + dateFrom + '&date_to=' + dateTo + '&order_by=id&sorting=DESC';
  if (filterStatus && filterStatus !== 'all') params += '&status=' + encodeURIComponent(filterStatus);

  var titleDate = dateFrom === dateTo ? dateFrom : dateFrom + ' – ' + dateTo;
  var titleEl = document.getElementById('team-table-title');
  if (titleEl) titleEl.textContent = 'Staff Attendance';

  var tbody = document.getElementById('team-tbody');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#9aabb7;">Loading data...</td></tr>';
  document.getElementById('team-pagination').innerHTML = '';

  apiRequest('/attendance' + params)
  .then(function(res) {
    var rows = res.data || [];
    if (!Array.isArray(rows)) rows = [];

    var filterDiv = document.getElementById('filter-division').value;
    if (filterDiv && filterDiv !== 'all') {
      rows = rows.filter(function(r) { return (r.division || r.dept || '') === filterDiv; });
    }

    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#9aabb7;font-size:13px;">No data</td></tr>';
      return;
    }

    var html = rows.map(function(r) {
      var name = r.user_name || 'Unknown';
      var avatarObj = {
        initials: name.substring(0, 2).toUpperCase(),
        name: name,
        role: ROLE_MAP_SHARED[r.user_role || ''] || (r.user_role || ''),
        color: 'linear-gradient(135deg,#3d5c45,#6dbf80)'
      };

      var ci = r.check_in_time  ? r.check_in_time.split(' ')[1].substring(0, 5)  : '--:--';
      var co = r.check_out_time ? r.check_out_time.split(' ')[1].substring(0, 5) : '--:--';

      var dur = '—';
      if (r.check_in_time && r.check_out_time) {
        var ciP = ci.split(':').map(Number);
        var coP = co.split(':').map(Number);
        var mins = (coP[0] * 60 + coP[1]) - (ciP[0] * 60 + ciP[1]);
        if (mins < 0) mins += 24 * 60;
        dur = Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm';
      }

      var dept = r.division || r.dept || '-';
      var sc = STATUS_MAP_SHARED[r.status] || { label: '● ' + (r.status || '-'), c: '#5a6b78', bg: '#f0f2f5' };
      var stCell = '<td><span class="badge-status" style="color:' + sc.c + ';background:' + sc.bg + ';">' + sc.label + '</span></td>';

      var lamp = r.face_image
        ? '<button class="btn-view" onclick=\'openPersonalModal(' + JSON.stringify(r) + ')\'>' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> View</button>'
        : '<span class="btn-view-na">—</span>';

      var ciCls = !r.check_in_time  ? ' pending-time' : '';
      var coCls = !r.check_out_time ? ' pending-time' : '';

      return '<tr>' +
        '<td>' + staffCell(avatarObj) + '</td>' +
        '<td class="staff-role">' + dept + '</td>' +
        '<td class="checkin-time' + ciCls + '">' + ci + '</td>' +
        '<td class="checkin-time' + coCls + '">' + co + '</td>' +
        '<td><span class="dur-pill">' + dur + '</span></td>' +
        stCell +
        '<td>' + lamp + '</td>' +
      '</tr>';
    }).join('');

    tbody.innerHTML = html;

    var total = res.total || (res.meta && res.meta.total) || 0;
    var lastPage = res.last_page
      || (res.meta && res.meta.last_page)
      || (total ? Math.ceil(total / teamLimit) : 0)
      || (rows.length >= teamLimit ? teamCurrentPage + 1 : teamCurrentPage);
    renderTeamPagination(lastPage);
  })
  .catch(function(err) {
    console.error('Error fetching team attendance:', err);
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#c0392b;font-size:13px;">Failed to load data</td></tr>';
  });
}

function renderTeamPagination(lastPage) {
  var wrap = document.getElementById('team-pagination');
  if (!wrap || lastPage <= 1) { if (wrap) wrap.innerHTML = ''; return; }

  var cur = teamCurrentPage;
  var html = '';

  html += '<button class="pg-btn" onclick="fetchTeamAttendance(' + (cur - 1) + ')"' +
    (cur <= 1 ? ' disabled' : '') + '>' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px;"><polyline points="15 18 9 12 15 6"/></svg>' +
    '</button>';

  var start = Math.max(1, cur - 2);
  var end   = Math.min(lastPage, cur + 2);
  if (start > 1) html += '<button class="pg-btn" onclick="fetchTeamAttendance(1)">1</button>' + (start > 2 ? '<span class="pg-ellipsis">…</span>' : '');
  for (var p = start; p <= end; p++) {
    html += '<button class="pg-btn' + (p === cur ? ' pg-active' : '') + '" onclick="fetchTeamAttendance(' + p + ')">' + p + '</button>';
  }
  if (end < lastPage) html += (end < lastPage - 1 ? '<span class="pg-ellipsis">…</span>' : '') + '<button class="pg-btn" onclick="fetchTeamAttendance(' + lastPage + ')">' + lastPage + '</button>';

  html += '<button class="pg-btn" onclick="fetchTeamAttendance(' + (cur + 1) + ')"' +
    (cur >= lastPage ? ' disabled' : '') + '>' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px;"><polyline points="9 18 15 12 9 6"/></svg>' +
    '</button>';

  html += '<span class="pg-info">Page ' + cur + ' of ' + lastPage + '</span>';
  wrap.innerHTML = html;
}

function staffCell(r) {
  return '<div class="staff-cell">' +
    '<div class="staff-avatar" style="background:' + r.color + ';">' + r.initials + '</div>' +
    '<div><div class="staff-name">' + r.name + '</div><div class="staff-role">' + r.role + '</div></div>' +
  '</div>';
}

/* ══ PENDING TABLE ══ */
function renderPendingTable() {
  document.getElementById('pending-count').textContent = pendingData.length + ' Pending';
  var html = pendingData.map(function(r, i) {
    return '<tr>' +
      '<td>' + staffCell(r) + '</td>' +
      '<td class="att-date">' + r.date + '</td>' +
      '<td style="font-size:13px;color:#4a5568;">' + r.note + '</td>' +
      '<td class="att-date" style="color:#9aabb7;">' + r.submitted + '</td>' +
      '<td><div style="display:flex;gap:6px;">' +
        '<button class="btn-approve" onclick="approvePending(' + i + ')">✓ Approve</button>' +
        '<button class="btn-reject"  onclick="rejectPending(' + i  + ')">✕ Reject</button>' +
      '</div></td>' +
    '</tr>';
  }).join('');
  document.getElementById('pending-tbody').innerHTML = html ||
    '<tr><td colspan="5" style="text-align:center;padding:1.5rem;color:#9aabb7;">No pending approvals</td></tr>';
}

function approvePending(i) {
  pendingData[i]._done = true;
  pendingData = pendingData.filter(function(r) { return !r._done; });
  renderPendingTable();
}
function rejectPending(i) {
  pendingData[i]._done = true;
  pendingData = pendingData.filter(function(r) { return !r._done; });
  renderPendingTable();
}

/* ══ DATE PICKER ══ */
var dpYear        = 2023;
var dpMonth       = 9;
var dpPickedDate  = null;
var dpPickedMonth = null;
var dpPickedYear  = null;
var dpOpen        = false;

function toggleDatePicker() {
  dpOpen = !dpOpen;
  var popup = document.getElementById('date-picker-popup');
  popup.style.display = dpOpen ? 'block' : 'none';
  if (dpOpen) renderDpCalendar();
}

function dpChangeMonth(dir) {
  dpMonth += dir;
  if (dpMonth > 11) { dpMonth = 0; dpYear++; }
  if (dpMonth < 0)  { dpMonth = 11; dpYear--; }
  renderDpCalendar();
}

function renderDpCalendar() {
  var MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
  document.getElementById('dp-month-label').textContent = MONTHS[dpMonth] + ' ' + dpYear;

  var firstDay  = new Date(dpYear, dpMonth, 1).getDay();
  var daysInMon = new Date(dpYear, dpMonth + 1, 0).getDate();
  var today     = new Date();

  var html = '';
  for (var i = 0; i < firstDay; i++) html += '<div class="dp-cell dp-empty"></div>';
  for (var d = 1; d <= daysInMon; d++) {
    var isToday = dpYear === today.getFullYear() && dpMonth === today.getMonth() && d === today.getDate();
    var isSel   = dpPickedDate === d && dpPickedMonth === dpMonth && dpPickedYear === dpYear;
    var cls = 'dp-cell' + (isToday ? ' dp-today' : '') + (isSel ? ' dp-selected' : '');
    html += '<div class="' + cls + '" onclick="dpSelectDay(' + d + ')">' + d + '</div>';
  }
  document.getElementById('dp-body').innerHTML = html;
}

function dpSelectDay(day) {
  dpPickedDate  = day;
  dpPickedMonth = dpMonth;
  dpPickedYear  = dpYear;

  var MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var dNames = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
  var dName  = dNames[new Date(dpYear, dpMonth, day).getDay()];
  var lbl    = dName + ', ' + day + ' ' + MONTHS_SHORT[dpMonth];
  document.getElementById('date-picker-label').textContent = lbl;
  document.getElementById('btn-date-picker').classList.add('open');
  /* show reset */
  var rb = document.getElementById('btn-reset-team');
  if (rb) rb.style.display = 'inline-flex';

  renderDpCalendar();
  fetchTeamAttendance();

  dpOpen = false;
  document.getElementById('date-picker-popup').style.display = 'none';
}

function dpSelectToday() {
  var t = new Date();
  dpYear = t.getFullYear(); dpMonth = t.getMonth();
  dpSelectDay(t.getDate());
}

function dpClearDate() {
  dpPickedDate = dpPickedMonth = dpPickedYear = null;
  selectedCalDay = null;
  document.getElementById('date-picker-label').textContent = 'Select Date';
  document.getElementById('btn-date-picker').classList.remove('open');
  /* hide reset */
  var rb = document.getElementById('btn-reset-team');
  if (rb) rb.style.display = 'none';
  renderDpCalendar();
  fetchTeamAttendance();
  dpOpen = false;
  document.getElementById('date-picker-popup').style.display = 'none';
}

/* Close picker on outside click */
document.addEventListener('click', function(e) {
  var wrap = document.getElementById('date-picker-wrap');
  if (wrap && !wrap.contains(e.target) && dpOpen) {
    dpOpen = false;
    document.getElementById('date-picker-popup').style.display = 'none';
  }
});

/* ══ MODAL ══ */
function openModal(r) {
  document.getElementById('modal-title').textContent    = r.name + ' — Attachment';
  document.getElementById('modal-subtitle').textContent = r.role + ' · ' + r.dept;

  /* Clock In photo */
  var mCi = document.getElementById('m-photo-ci');
  var mCiT = document.getElementById('m-time-ci');
  if (r.hasPhoto && r.ci !== '—') {
    mCi.classList.remove('modal-photo-wrap--dim');
    mCi.querySelector('.photo-inner').innerHTML =
      '<svg viewBox="0 0 80 80" fill="none" width="48" height="48"><circle cx="40" cy="40" r="20" stroke="#4a7c59" stroke-width="2" fill="none"/><circle cx="32" cy="35" r="3" fill="#4a7c59"/><circle cx="48" cy="35" r="3" fill="#4a7c59"/><path d="M32 48 Q40 54 48 48" stroke="#4a7c59" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M10 24 L10 10 L24 10" stroke="#4a7c59" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M56 10 L70 10 L70 24" stroke="#4a7c59" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M10 56 L10 70 L24 70" stroke="#4a7c59" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M70 56 L70 70 L56 70" stroke="#4a7c59" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>' +
      '<div class="photo-scan-line"></div><div class="photo-label">Verified</div>';
    mCiT.textContent = r.ci; mCiT.style.color = '#2c3e50';
  } else {
    mCi.classList.add('modal-photo-wrap--dim');
    mCi.querySelector('.photo-inner').innerHTML =
      '<svg viewBox="0 0 80 80" fill="none" width="48" height="48" opacity="0.3"><circle cx="40" cy="40" r="20" stroke="#9aabb7" stroke-width="2" fill="none"/><circle cx="32" cy="35" r="3" fill="#9aabb7"/><circle cx="48" cy="35" r="3" fill="#9aabb7"/><path d="M32 48 Q40 54 48 48" stroke="#9aabb7" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M10 24 L10 10 L24 10" stroke="#9aabb7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M56 10 L70 10 L70 24" stroke="#9aabb7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M10 56 L10 70 L24 70" stroke="#9aabb7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M70 56 L70 70 L56 70" stroke="#9aabb7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>' +
      '<div class="photo-label" style="color:#b0bec5;">No Data</div>';
    mCiT.textContent = '--:--'; mCiT.style.color = '#b0bec5';
  }

  /* Clock Out photo */
  var mCo = document.getElementById('m-photo-co');
  var mCoT = document.getElementById('m-time-co');
  if (r.hasPhoto && r.co !== '—') {
    mCo.classList.remove('modal-photo-wrap--dim');
    mCo.querySelector('.photo-inner').innerHTML =
      '<svg viewBox="0 0 80 80" fill="none" width="48" height="48"><circle cx="40" cy="40" r="20" stroke="#4a7c59" stroke-width="2" fill="none"/><circle cx="32" cy="35" r="3" fill="#4a7c59"/><circle cx="48" cy="35" r="3" fill="#4a7c59"/><path d="M32 48 Q40 54 48 48" stroke="#4a7c59" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M10 24 L10 10 L24 10" stroke="#4a7c59" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M56 10 L70 10 L70 24" stroke="#4a7c59" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M10 56 L10 70 L24 70" stroke="#9aabb7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M70 56 L70 70 L56 70" stroke="#4a7c59" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>' +
      '<div class="photo-scan-line"></div><div class="photo-label">Verified</div>';
    mCoT.textContent = r.co; mCoT.style.color = '#2c3e50';
  } else {
    mCo.classList.add('modal-photo-wrap--dim');
    mCoT.textContent = '--:--'; mCoT.style.color = '#b0bec5';
  }

  var sc = STATUS_MAP_SHARED[r.status] || { label: '● ' + (r.status || '-'), c: '#5a6b78', bg: '#f0f2f5' };
  document.getElementById('modal-details').innerHTML =
    di('NAME',     r.name) + di('DIVISION',  r.dept) +
    di('CLOCK IN', r.ci !== '—' ? r.ci : '--:--') +
    di('CLOCK OUT', r.co !== '—' ? r.co : '--:--') +
    di('STATUS',   '<span class="badge-status" style="color:' + sc.c + ';background:' + sc.bg + ';font-size:11px;">' + sc.label + '</span>') +
    di('ROLE', r.role);

  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function di(label, value) {
  return '<div class="detail-item"><div class="detail-item-label">' + label + '</div>' +
    '<div class="detail-item-value">' + value + '</div></div>';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });

/* ══ INIT ══ */
window.addEventListener('load', function() {
  var pad = function(n) { return n.toString().padStart(2, '0'); };
  var today = new Date();
  var todayStr = today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate());

  ['filter-personal-from','filter-personal-to','filter-team-from','filter-team-to'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = todayStr;
  });

  fetchTeamAttendance();
  fetchPersonalAttendance();
});

/* ══════════════════════════════════════════════
   PERSONAL ATTENDANCE
══════════════════════════════════════════════ */

function fetchPersonalAttendance() {
  var dateFrom = document.getElementById('filter-personal-from').value;
  var dateTo   = document.getElementById('filter-personal-to').value;
  var status   = document.getElementById('filter-personal-status').value;

  var params = '?view=own&page=1&limit=50&order_by=id&sorting=DESC';
  if (dateFrom) params += '&date_from=' + dateFrom;
  if (dateTo)   params += '&date_to='   + dateTo;
  if (status)   params += '&status='    + encodeURIComponent(status);

  var tbody = document.getElementById('personal-tbody');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#9aabb7;">Loading data...</td></tr>';

  apiRequest('/attendance' + params)
  .then(function(res) {
    var rows = res.data || [];
    if (!Array.isArray(rows)) rows = [];

    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#9aabb7;font-size:13px;">No data</td></tr>';
      return;
    }

    var MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    var html = rows.map(function(r) {
      var dateStr = r.shift_date || '';
      var formattedDate = dateStr;
      if (dateStr) {
        var d = new Date(dateStr + 'T00:00:00');
        formattedDate = DAY_SHORT[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS_SHORT[d.getMonth()] + ' ' + d.getFullYear();
      }

      var ci = r.check_in_time  ? r.check_in_time.split(' ')[1].substring(0, 5)  : '--:--';
      var co = r.check_out_time ? r.check_out_time.split(' ')[1].substring(0, 5) : '--:--';

      var dur = '—';
      if (r.check_in_time && r.check_out_time) {
        var ciP = ci.split(':').map(Number);
        var coP = co.split(':').map(Number);
        var mins = (coP[0] * 60 + coP[1]) - (ciP[0] * 60 + ciP[1]);
        if (mins < 0) mins += 24 * 60;
        dur = Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm';
      }

      var sessionBadge = '<span class="shift-badge morning" style="font-size:11px;">Session ' + (r.session || 1) + '</span>';

      var sc = STATUS_MAP_SHARED[r.status] || { label: '● ' + r.status, c: '#5a6b78', bg: '#f0f2f5' };
      var stCell = '<span class="badge-status" style="color:' + sc.c + ';background:' + sc.bg + ';">' + sc.label + '</span>';

      var lamp = r.face_image
        ? '<button class="btn-view" onclick=\'openPersonalModal(' + JSON.stringify(r) + ')\'>' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> View</button>'
        : '<span class="btn-view-na">—</span>';

      var ciCls = !r.check_in_time  ? ' pending-time' : '';
      var coCls = !r.check_out_time ? ' pending-time' : '';

      return '<tr>' +
        '<td class="att-date">' + formattedDate + '</td>' +
        '<td>' + sessionBadge + '</td>' +
        '<td class="checkin-time' + ciCls + '">' + ci + '</td>' +
        '<td class="checkin-time' + coCls + '">' + co + '</td>' +
        '<td><span class="dur-pill">' + dur + '</span></td>' +
        '<td>' + stCell + '</td>' +
        '<td>' + lamp + '</td>' +
      '</tr>';
    }).join('');

    tbody.innerHTML = html;
  })
  .catch(function(err) {
    console.error('Error fetching personal attendance:', err);
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#c0392b;font-size:13px;">Failed to load data</td></tr>';
  });
}

function resetPersonalFilters() {
  var pad = function(n) { return n.toString().padStart(2, '0'); };
  var t = new Date();
  var todayStr = t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate());
  document.getElementById('filter-personal-from').value = todayStr;
  document.getElementById('filter-personal-to').value   = todayStr;
  document.getElementById('filter-personal-status').value = '';
  fetchPersonalAttendance();
}

function resetTeamFilters() {
  var pad = function(n) { return n.toString().padStart(2, '0'); };
  var t = new Date();
  var todayStr = t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate());
  document.getElementById('filter-team-from').value   = todayStr;
  document.getElementById('filter-team-to').value     = todayStr;
  document.getElementById('filter-team-status').value = '';
  document.getElementById('filter-division').value    = 'all';
  teamCurrentPage = 1;
  fetchTeamAttendance();
}

function resetSummaryFilters() {
  var sel = document.getElementById('filter-summary-month');
  if (sel) {
    sel.selectedIndex = 0;
    fetchAttendanceSummary(sel.value);
  }
}

function openPersonalModal(r) {
  var ci = r.check_in_time  ? r.check_in_time.split(' ')[1].substring(0, 5)  : '--:--';
  var co = r.check_out_time ? r.check_out_time.split(' ')[1].substring(0, 5) : '--:--';

  document.getElementById('modal-title').textContent    = (r.user_name || 'Me') + ' — Attachment';
  document.getElementById('modal-subtitle').textContent = 'Session ' + (r.session || 1) + ' · ' + (r.shift_date || '');

  var mCi = document.getElementById('m-photo-ci');
  var mCiT = document.getElementById('m-time-ci');
  if (r.face_image) {
    mCi.classList.remove('modal-photo-wrap--dim');
    mCi.querySelector('.photo-inner').innerHTML =
      '<img src="' + r.face_image + '" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">';
    mCiT.textContent = ci; mCiT.style.color = '#2c3e50';
  } else {
    mCi.classList.add('modal-photo-wrap--dim');
    mCi.querySelector('.photo-inner').innerHTML =
      '<svg viewBox="0 0 80 80" fill="none" width="48" height="48" opacity="0.3"><circle cx="40" cy="40" r="20" stroke="#9aabb7" stroke-width="2" fill="none"/><circle cx="32" cy="35" r="3" fill="#9aabb7"/><circle cx="48" cy="35" r="3" fill="#9aabb7"/><path d="M32 48 Q40 54 48 48" stroke="#9aabb7" stroke-width="2" stroke-linecap="round" fill="none"/></svg>' +
      '<div class="photo-label" style="color:#b0bec5;">No Data</div>';
    mCiT.textContent = ci; mCiT.style.color = r.check_in_time ? '#2c3e50' : '#b0bec5';
  }

  var mCo = document.getElementById('m-photo-co');
  var mCoT = document.getElementById('m-time-co');
  mCo.classList.add('modal-photo-wrap--dim');
  mCoT.textContent = co; mCoT.style.color = r.check_out_time ? '#2c3e50' : '#b0bec5';

  var sc = STATUS_MAP_SHARED[r.status] || { label: '● ' + r.status, c: '#5a6b78', bg: '#f0f2f5' };
  document.getElementById('modal-details').innerHTML =
    di('DATE',      r.shift_date || '-') +
    di('SESSION',   String(r.session || 1)) +
    di('CLOCK IN',  ci) +
    di('CLOCK OUT', co) +
    di('STATUS',    '<span class="badge-status" style="color:' + sc.c + ';background:' + sc.bg + ';font-size:11px;">' + sc.label + '</span>') +
    di('DISTANCE',  r.distance_to_office != null ? r.distance_to_office + ' m' : '-');

  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
