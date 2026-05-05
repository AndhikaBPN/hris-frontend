/* ══════════════════════════════════════════════
   ATTENDANCE MANAGER JS
══════════════════════════════════════════════ */

/* ── Shared utils ── */
function setActive(el) {
  document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
  el.classList.add('active');
}
function exportReport() { alert('Export laporan berhasil! File akan diunduh.'); }

/* ══ DATA ══ */
var teamData = [
  { initials:'AR', name:'Alex Rivera',  color:'linear-gradient(135deg,#3d5c45,#6dbf80)', role:'Support Eng',   dept:'Engineering', ci:'08:55', co:'17:05', status:'complete', hasPhoto:true  },
  { initials:'SC', name:'Sam Chen',     color:'linear-gradient(135deg,#4a6080,#7a9abf)', role:'Data Analyst',  dept:'Engineering', ci:'09:15', co:'17:00', status:'late',     hasPhoto:true  },
  { initials:'JL', name:'Jordan Lee',   color:'linear-gradient(135deg,#c0392b,#e07060)', role:'QA Tester',     dept:'Engineering', ci:'—',     co:'—',     status:'pending',  hasPhoto:false },
  { initials:'MP', name:'Maya Putri',   color:'linear-gradient(135deg,#7d5a9a,#b08bc0)', role:'UI Designer',   dept:'Design',      ci:'08:48', co:'17:02', status:'complete', hasPhoto:true  },
  { initials:'RW', name:'Ryan Wijaya',  color:'linear-gradient(135deg,#b07830,#d4a860)', role:'Backend Dev',   dept:'Engineering', ci:'09:22', co:'17:10', status:'late',     hasPhoto:true  },
  { initials:'DN', name:'Diana Nas',    color:'linear-gradient(135deg,#2980b9,#5dade2)', role:'Product Mgr',   dept:'Product',     ci:'08:30', co:'17:00', status:'complete', hasPhoto:true  },
  { initials:'BK', name:'Budi Kurnia',  color:'linear-gradient(135deg,#8e44ad,#bb8fce)', role:'DevOps',        dept:'Engineering', ci:'—',     co:'—',     status:'pending',  hasPhoto:false },
  { initials:'LS', name:'Lisa Santoso', color:'linear-gradient(135deg,#16a085,#48c9b0)', role:'HR Specialist', dept:'HR',          ci:'09:05', co:'17:00', status:'complete', hasPhoto:true  },
  { initials:'FR', name:'Fina Rahma',   color:'linear-gradient(135deg,#c0392b,#e74c3c)', role:'Ops Manager',   dept:'HR',          ci:'—',     co:'—',     status:'leave',    hasPhoto:false },
];

var pendingData = [
  { initials:'JL', name:'Jordan Lee',  color:'linear-gradient(135deg,#c0392b,#e07060)', date:'Sel, 24 Okt', note:'Lupa clock in — ada meeting pagi', submitted:'10 mnt lalu' },
  { initials:'BK', name:'Budi Kurnia', color:'linear-gradient(135deg,#8e44ad,#bb8fce)', date:'Sel, 24 Okt', note:'Sistem error saat clock in',        submitted:'25 mnt lalu' },
];

/* Ringkasan bulanan per karyawan */
var summaryData = [
  { initials:'AR', name:'Alex Rivera',  color:'linear-gradient(135deg,#3d5c45,#6dbf80)', role:'Support Eng',   total:22, hadir:20, late:2, absent:0, cuti:2  },
  { initials:'SC', name:'Sam Chen',     color:'linear-gradient(135deg,#4a6080,#7a9abf)', role:'Data Analyst',  total:22, hadir:18, late:4, absent:2, cuti:0  },
  { initials:'JL', name:'Jordan Lee',   color:'linear-gradient(135deg,#c0392b,#e07060)', role:'QA Tester',     total:22, hadir:15, late:1, absent:4, cuti:3  },
  { initials:'MP', name:'Maya Putri',   color:'linear-gradient(135deg,#7d5a9a,#b08bc0)', role:'UI Designer',   total:22, hadir:21, late:1, absent:0, cuti:1  },
  { initials:'RW', name:'Ryan Wijaya',  color:'linear-gradient(135deg,#b07830,#d4a860)', role:'Backend Dev',   total:22, hadir:19, late:3, absent:1, cuti:2  },
  { initials:'DN', name:'Diana Nas',    color:'linear-gradient(135deg,#2980b9,#5dade2)', role:'Product Mgr',   total:22, hadir:22, late:0, absent:0, cuti:0  },
  { initials:'BK', name:'Budi Kurnia',  color:'linear-gradient(135deg,#8e44ad,#bb8fce)', role:'DevOps',        total:22, hadir:16, late:2, absent:4, cuti:2  },
  { initials:'LS', name:'Lisa Santoso', color:'linear-gradient(135deg,#16a085,#48c9b0)', role:'HR Specialist', total:22, hadir:21, late:1, absent:0, cuti:1  },
  { initials:'FR', name:'Fina Rahma',   color:'linear-gradient(135deg,#c0392b,#e74c3c)', role:'Ops Manager',   total:22, hadir:18, late:0, absent:1, cuti:3  },
];

/* Attendance % per tanggal (simulasi team view) */
var teamAttPct = {
  1:92, 2:88, 3:95, 4:78, 5:100, 6:85, 8:90, 9:88, 10:72,
  11:95, 12:100, 14:88, 15:91, 16:78, 17:95, 18:100, 19:88,
  21:85, 22:78, 23:92, 24:78, 25:95, 28:88, 29:91, 30:85
};

/* Shift saya */
var myShifts = {
  1:'morning',2:'morning',3:'evening',4:'evening',5:'night',
  6:'night',7:'dayoff',8:'morning',9:'morning',10:'evening',
  11:'evening',12:'night',13:'dayoff',14:'morning',15:'morning',
  16:'evening',17:'evening',18:'night',19:'night',20:'dayoff',
  21:'morning',22:'morning',23:'evening',24:'evening',25:'night',
  26:'night',27:'dayoff',28:'morning',29:'morning',30:'evening',31:'evening'
};
var shiftLabel = { morning:'Morning', evening:'Evening', night:'Night', dayoff:'Day Off' };

var STATUS_CLASS = { complete:'complete', late:'late', pending:'approved', leave:'approved' };
var STATUS_LABEL = { complete:'● Complete', late:'● Late Entry', pending:'● Pending', leave:'● On Leave' };

/* ══ SUMMARY STRIP ══ */
function renderSummary() {
  var hadir  = teamData.filter(function(r){ return r.status === 'complete'; }).length;
  var late   = teamData.filter(function(r){ return r.status === 'late'; }).length;
  var absent = teamData.filter(function(r){ return r.status === 'pending'; }).length;
  var cuti   = teamData.filter(function(r){ return r.status === 'leave'; }).length;
  var total  = teamData.length;
  var rate   = Math.round(((hadir + late) / total) * 100);

  document.getElementById('sum-hadir').textContent  = hadir;
  document.getElementById('sum-late').textContent   = late;
  document.getElementById('sum-absent').textContent = absent;
  document.getElementById('sum-cuti').textContent   = cuti;
  document.getElementById('sum-rate').textContent   = rate + '%';
}

/* ══ CALENDAR ══ */
var calYear   = 2023;
var calMonth  = 9; // Oktober
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
      '<div class="cal-legend-item"><span class="cal-legend-dot dot-high"></span> ≥90% hadir</div>' +
      '<div class="cal-legend-item"><span class="cal-legend-dot dot-medium"></span> 70–89%</div>' +
      '<div class="cal-legend-item"><span class="cal-legend-dot dot-low"></span> &lt;70%</div>' +
      '<div class="cal-legend-item"><span class="cal-legend-dot dot-nodata"></span> Tidak ada data</div>';
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
      var tip  = pct !== undefined ? pct + '% hadir' : 'No data';
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
    document.getElementById('date-picker-label').textContent = 'Pilih Tanggal';
    document.getElementById('btn-date-picker').classList.remove('open');
  } else {
    selectedCalDay = day;
    /* Sync date picker */
    var MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var dNames = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
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
  renderTeamTable();
  renderLateAlerts();
}

/* ══ LATE ALERTS ══ */
function renderLateAlerts() {
  var lateRows = teamData.filter(function(r) { return r.status === 'late'; });
  var badge = document.getElementById('late-count-badge');
  badge.textContent = lateRows.length;
  badge.className   = 'late-count-badge' + (lateRows.length === 0 ? ' zero' : '');

  var html = lateRows.map(function(r) {
    /* Hitung menit terlambat (simulasi) */
    var late = Math.floor(Math.random() * 25) + 5; // 5-30 mnt
    return '<div class="late-item">' +
      '<div class="late-item-avatar" style="background:' + r.color + ';">' + r.initials + '</div>' +
      '<div>' +
        '<div class="late-item-name">' + r.name + '</div>' +
        '<div class="late-item-role">' + r.role + '</div>' +
      '</div>' +
      '<div class="late-item-right">' +
        '<div class="late-item-time">' + r.ci + '</div>' +
        '<div class="late-item-delta">+' + late + ' mnt</div>' +
      '</div>' +
    '</div>';
  }).join('');

  document.getElementById('late-alerts-list').innerHTML = html ||
    '<div class="late-empty">Tidak ada keterlambatan hari ini 🎉</div>';
}

/* ══ TEAM TABLE ══ */
function renderTeamTable() {
  var filterStatus = document.getElementById('filter-team-status').value;
  var filterDiv    = document.getElementById('filter-division').value;

  var rows = teamData.filter(function(r) {
    var okStatus = filterStatus === 'all' || r.status === filterStatus;
    var okDiv    = filterDiv    === 'all' || r.dept    === filterDiv;
    return okStatus && okDiv;
  });

  var html = rows.map(function(r) {
    var dur = '—';
    if (r.ci !== '—' && r.co !== '—') {
      var ciP = r.ci.split(':').map(Number), coP = r.co.split(':').map(Number);
      var mins = (coP[0]*60+coP[1]) - (ciP[0]*60+ciP[1]);
      dur = Math.floor(mins/60) + 'j ' + (mins%60) + 'm';
    }

    var lamp = r.hasPhoto
      ? '<button class="btn-view" onclick=\'openModal(' + JSON.stringify(r) + ')\'>' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
          'stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;">' +
          '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>' +
          '<circle cx="12" cy="12" r="3"/></svg> View</button>'
      : '<span class="btn-view-na">—</span>';

    var ciCls = r.ci === '—' ? ' pending-time' : '';
    var coCls = r.co === '—' ? ' pending-time' : '';

    return '<tr>' +
      '<td>' + staffCell(r) + '</td>' +
      '<td class="staff-role">' + r.dept + '</td>' +
      '<td class="checkin-time' + ciCls + '">' + r.ci + '</td>' +
      '<td class="checkin-time' + coCls + '">' + r.co + '</td>' +
      '<td><span class="dur-pill">' + dur + '</span></td>' +
      '<td><span class="badge-status ' + (STATUS_CLASS[r.status]||'approved') + '">' + (STATUS_LABEL[r.status]||r.status) + '</span></td>' +
      '<td>' + lamp + '</td>' +
    '</tr>';
  }).join('');

  document.getElementById('team-tbody').innerHTML = html ||
    '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#9aabb7;">Tidak ada data</td></tr>';
}

function staffCell(r) {
  return '<div class="staff-cell">' +
    '<div class="staff-avatar" style="background:' + r.color + ';">' + r.initials + '</div>' +
    '<div><div class="staff-name">' + r.name + '</div><div class="staff-role">' + r.role + '</div></div>' +
  '</div>';
}

/* ══ SUMMARY TABLE ══ */
function renderSummaryTable() {
  var html = summaryData.map(function(r) {
    var rate = Math.round((r.hadir / r.total) * 100);
    var barColor = rate >= 90 ? '#2e7d4f' : rate >= 70 ? '#f39c12' : '#c0392b';
    return '<tr>' +
      '<td>' + staffCell(r) + '</td>' +
      '<td class="checkin-time">' + r.total + '</td>' +
      '<td class="checkin-time">' + r.hadir + '</td>' +
      '<td class="checkin-time">' + (r.late  ? '<span style="color:#b06000;font-weight:500;">' + r.late  + '</span>' : '0') + '</td>' +
      '<td class="checkin-time">' + (r.absent? '<span style="color:#c0392b;font-weight:500;">' + r.absent + '</span>' : '0') + '</td>' +
      '<td class="checkin-time">' + r.cuti + '</td>' +
      '<td><div class="rate-bar-wrap">' +
        '<div class="rate-bar"><div class="rate-bar-fill" style="width:' + rate + '%;background:' + barColor + ';"></div></div>' +
        '<span class="rate-pct">' + rate + '%</span>' +
      '</div></td>' +
    '</tr>';
  }).join('');
  document.getElementById('summary-tbody').innerHTML = html;
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
    '<tr><td colspan="5" style="text-align:center;padding:1.5rem;color:#9aabb7;">Tidak ada pending approval</td></tr>';
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
  renderTeamTable();

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
  document.getElementById('date-picker-label').textContent = 'Pilih Tanggal';
  document.getElementById('btn-date-picker').classList.remove('open');
  /* hide reset */
  var rb = document.getElementById('btn-reset-team');
  if (rb) rb.style.display = 'none';
  renderDpCalendar();
  renderTeamTable();
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
  document.getElementById('modal-title').textContent    = r.name + ' — Lampiran';
  document.getElementById('modal-subtitle').textContent = r.role + ' · ' + r.dept;

  /* Clock In photo */
  var mCi = document.getElementById('m-photo-ci');
  var mCiT = document.getElementById('m-time-ci');
  if (r.hasPhoto && r.ci !== '—') {
    mCi.classList.remove('modal-photo-wrap--dim');
    mCi.querySelector('.photo-inner').innerHTML =
      '<svg viewBox="0 0 80 80" fill="none" width="48" height="48"><circle cx="40" cy="40" r="20" stroke="#4a7c59" stroke-width="2" fill="none"/><circle cx="32" cy="35" r="3" fill="#4a7c59"/><circle cx="48" cy="35" r="3" fill="#4a7c59"/><path d="M32 48 Q40 54 48 48" stroke="#4a7c59" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M10 24 L10 10 L24 10" stroke="#4a7c59" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M56 10 L70 10 L70 24" stroke="#4a7c59" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M10 56 L10 70 L24 70" stroke="#4a7c59" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M70 56 L70 70 L56 70" stroke="#4a7c59" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>' +
      '<div class="photo-scan-line"></div><div class="photo-label">Terverifikasi</div>';
    mCiT.textContent = r.ci; mCiT.style.color = '#2c3e50';
  } else {
    mCi.classList.add('modal-photo-wrap--dim');
    mCi.querySelector('.photo-inner').innerHTML =
      '<svg viewBox="0 0 80 80" fill="none" width="48" height="48" opacity="0.3"><circle cx="40" cy="40" r="20" stroke="#9aabb7" stroke-width="2" fill="none"/><circle cx="32" cy="35" r="3" fill="#9aabb7"/><circle cx="48" cy="35" r="3" fill="#9aabb7"/><path d="M32 48 Q40 54 48 48" stroke="#9aabb7" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M10 24 L10 10 L24 10" stroke="#9aabb7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M56 10 L70 10 L70 24" stroke="#9aabb7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M10 56 L10 70 L24 70" stroke="#9aabb7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M70 56 L70 70 L56 70" stroke="#9aabb7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>' +
      '<div class="photo-label" style="color:#b0bec5;">Tidak ada</div>';
    mCiT.textContent = '--:--'; mCiT.style.color = '#b0bec5';
  }

  /* Clock Out photo */
  var mCo = document.getElementById('m-photo-co');
  var mCoT = document.getElementById('m-time-co');
  if (r.hasPhoto && r.co !== '—') {
    mCo.classList.remove('modal-photo-wrap--dim');
    mCo.querySelector('.photo-inner').innerHTML =
      '<svg viewBox="0 0 80 80" fill="none" width="48" height="48"><circle cx="40" cy="40" r="20" stroke="#4a7c59" stroke-width="2" fill="none"/><circle cx="32" cy="35" r="3" fill="#4a7c59"/><circle cx="48" cy="35" r="3" fill="#4a7c59"/><path d="M32 48 Q40 54 48 48" stroke="#4a7c59" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M10 24 L10 10 L24 10" stroke="#4a7c59" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M56 10 L70 10 L70 24" stroke="#4a7c59" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M10 56 L10 70 L24 70" stroke="#9aabb7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M70 56 L70 70 L56 70" stroke="#4a7c59" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>' +
      '<div class="photo-scan-line"></div><div class="photo-label">Terverifikasi</div>';
    mCoT.textContent = r.co; mCoT.style.color = '#2c3e50';
  } else {
    mCo.classList.add('modal-photo-wrap--dim');
    mCoT.textContent = '--:--'; mCoT.style.color = '#b0bec5';
  }

  document.getElementById('modal-details').innerHTML =
    di('NAMA',     r.name) + di('DIVISI',    r.dept) +
    di('CLOCK IN', r.ci !== '—' ? r.ci : '--:--') +
    di('CLOCK OUT', r.co !== '—' ? r.co : '--:--') +
    di('STATUS',   '<span class="badge-status ' + (STATUS_CLASS[r.status]||'approved') +
       '" style="font-size:11px;">' + (STATUS_LABEL[r.status]||r.status) + '</span>') +
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
  renderSummary();
  renderTeamTable();
  renderSummaryTable();
  fetchPersonalAttendance();
});

/* ══════════════════════════════════════════════
   ABSENSI PERSONAL
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
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#9aabb7;">Memuat data...</td></tr>';

  apiRequest('/attendance' + params)
  .then(function(res) {
    var rows = res.data || [];
    if (!Array.isArray(rows)) rows = [];

    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#9aabb7;font-size:13px;">Tidak ada data</td></tr>';
      return;
    }

    var MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var DAY_SHORT = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

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
        dur = Math.floor(mins / 60) + 'j ' + (mins % 60) + 'm';
      }

      var sessionBadge = '<span class="shift-badge morning" style="font-size:11px;">Sesi ' + (r.session || 1) + '</span>';

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
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#c0392b;font-size:13px;">Gagal memuat data</td></tr>';
  });
}

function openPersonalModal(r) {
  var ci = r.check_in_time  ? r.check_in_time.split(' ')[1].substring(0, 5)  : '--:--';
  var co = r.check_out_time ? r.check_out_time.split(' ')[1].substring(0, 5) : '--:--';

  document.getElementById('modal-title').textContent    = (r.user_name || 'Saya') + ' — Lampiran';
  document.getElementById('modal-subtitle').textContent = 'Sesi ' + (r.session || 1) + ' · ' + (r.shift_date || '');

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
      '<div class="photo-label" style="color:#b0bec5;">Tidak ada</div>';
    mCiT.textContent = ci; mCiT.style.color = r.check_in_time ? '#2c3e50' : '#b0bec5';
  }

  var mCo = document.getElementById('m-photo-co');
  var mCoT = document.getElementById('m-time-co');
  mCo.classList.add('modal-photo-wrap--dim');
  mCoT.textContent = co; mCoT.style.color = r.check_out_time ? '#2c3e50' : '#b0bec5';

  var sc = STATUS_MAP_SHARED[r.status] || { label: '● ' + r.status, c: '#5a6b78', bg: '#f0f2f5' };
  document.getElementById('modal-details').innerHTML =
    di('TANGGAL',   r.shift_date || '-') +
    di('SESI',      String(r.session || 1)) +
    di('CLOCK IN',  ci) +
    di('CLOCK OUT', co) +
    di('STATUS',    '<span class="badge-status" style="color:' + sc.c + ';background:' + sc.bg + ';font-size:11px;">' + sc.label + '</span>') +
    di('JARAK',     r.distance_to_office != null ? r.distance_to_office + ' m' : '-');

  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
