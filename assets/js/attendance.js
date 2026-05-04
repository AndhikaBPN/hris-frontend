/* ══════════════════════════════════════════════
   ATTENDANCE.JS  –  API Integration
   - Default: 1st of current month → today
   - Calendar dots from real API data
   - Date range / single-date filter
   - Status filter + Reset button
══════════════════════════════════════════════ */


/* ── State ── */
var calYear, calMonth;
var selFrom = null;   // { y, m, d } — first clicked (or only) date
var selTo   = null;   // { y, m, d } — shift+clicked date (range end), null = single
var apiRecords    = [];
var recordsByDate = {};
var currentFilters = { date_from: getMonthStartStr(), date_to: getTodayStr(), status: 'all' };

/* helper: compare two { y,m,d } objects */
function dateCmp(a, b) {
  if (a.y !== b.y) return a.y - b.y;
  if (a.m !== b.m) return a.m - b.m;
  return a.d - b.d;
}
function dateToStr(o) { return o.y + '-' + pad(o.m+1) + '-' + pad(o.d); }

/* ── Status mapping (API values → display) ── */
var statusCls   = { valid:'complete', late:'late', invalid:'pending', on_leave:'approved', leave:'approved', 'sick-leave':'approved', permit:'approved' };
var statusLabel = { valid:'● Valid',  late:'● Late', invalid:'● Invalid', on_leave:'● On Leave', leave:'● Leave', 'sick-leave':'● Sick Leave', permit:'● Permit' };

/* ── Utilities ── */
function getToken() { return localStorage.getItem('hris_token') || ''; }
function pad(n)     { return n < 10 ? '0'+n : ''+n; }

function getTodayStr() {
  var d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate());
}
function getMonthStartStr() {
  var d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-01';
}
function formatTime(dt) {
  if (!dt) return '—';
  var parts = dt.split(' ');
  return parts[1] ? parts[1].substring(0,5) : '—';
}
function formatDateDisplay(dateStr) {
  if (!dateStr) return '—';
  var d = new Date(dateStr + 'T00:00:00');
  var days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()];
}
function showTableMessage(msg, isError) {
  var tbody = document.getElementById('att-main-tbody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:'
    + (isError ? '#e57373' : '#9aabb7') + ';font-size:13px;">' + msg + '</td></tr>';
}

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
window.addEventListener('load', function() {
  var d = new Date();
  calYear  = d.getFullYear();
  calMonth = d.getMonth();
  currentFilters.date_from = getMonthStartStr();
  currentFilters.date_to   = getTodayStr();
  fetchAttendance();
});

/* ══════════════════════════════════════════════
   API FETCH
══════════════════════════════════════════════ */
function fetchAttendance() {
  var token = getToken();
  if (!token) { showTableMessage('Please log in to view attendance data.'); renderCalendar(); return; }

  showTableMessage('Loading...');

  var path = '/attendance?page=1&limit=50&order_by=id&sorting=DESC';
  if (currentFilters.date_from) path += '&date_from=' + currentFilters.date_from;
  if (currentFilters.date_to)   path += '&date_to='   + currentFilters.date_to;

  apiRequest(path)
    .then(function(resp) {
      if (resp.success) {
        apiRecords = resp.data || [];
        recordsByDate = {};
        apiRecords.forEach(function(rec) {
          var dk = rec.shift_date;
          if (!recordsByDate[dk]) recordsByDate[dk] = [];
          recordsByDate[dk].push(rec);
        });
        renderCalendar();
        renderAttTable();
        updateNextShiftPanel();
      } else {
        showTableMessage('Failed to load data.');
        renderCalendar();
      }
    })
    .catch(function(err) {
      console.error('Attendance API error:', err);
      showTableMessage('Error: ' + err.message, true);
      renderCalendar();
    });
}

/* ══════════════════════════════════════════════
   CALENDAR
══════════════════════════════════════════════ */
function changeMonth(dir) {
  calMonth += dir;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0)  { calMonth = 11; calYear--; }

  // Clear calendar selection
  selFrom = null;
  selTo   = null;
  updateTableTitle();

  var firstDay = calYear + '-' + pad(calMonth+1) + '-01';
  var lastDay  = calYear + '-' + pad(calMonth+1) + '-' + pad(new Date(calYear, calMonth+1, 0).getDate());
  currentFilters.date_from = firstDay;
  currentFilters.date_to   = lastDay;

  fetchAttendance();
}

function renderCalendar() {
  var MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
  var label = document.getElementById('cal-month-label');
  if (label) label.textContent = MONTHS[calMonth] + ' ' + calYear;

  var firstWeekday = new Date(calYear, calMonth, 1).getDay();
  var daysInMonth  = new Date(calYear, calMonth+1, 0).getDate();
  var today        = new Date();

  // Normalise range so from <= to
  var rFrom = selFrom, rTo = selTo;
  if (rFrom && rTo && dateCmp(rFrom, rTo) > 0) { var tmp = rFrom; rFrom = rTo; rTo = tmp; }

  var html = '';
  for (var i = 0; i < firstWeekday; i++) html += '<div class="cal-cell empty"></div>';

  for (var d = 1; d <= daysInMonth; d++) {
    var dateStr = calYear + '-' + pad(calMonth+1) + '-' + pad(d);
    var cellObj = { y: calYear, m: calMonth, d: d };
    var isToday = calYear === today.getFullYear() && calMonth === today.getMonth() && d === today.getDate();
    var isSat   = new Date(calYear, calMonth, d).getDay() === 6;
    var records = recordsByDate[dateStr] || [];

    // Selection classes
    var isStart  = selFrom && selFrom.y === calYear && selFrom.m === calMonth && selFrom.d === d;
    var isEnd    = rTo   && rTo.y   === calYear && rTo.m   === calMonth && rTo.d   === d;
    var isInRange = rFrom && rTo && dateCmp(cellObj, rFrom) > 0 && dateCmp(cellObj, rTo) < 0;
    var isSingle  = selFrom && !selTo && isStart; // single selection, no range end yet

    var dotClass = 'none';
    if (records.length > 0) {
      if (records.some(function(r) { return r.status === 'invalid'; }))   dotClass = 'night';
      else if (records.some(function(r) { return r.status === 'late'; })) dotClass = 'evening';
      else dotClass = 'morning';
    }

    var cls = 'cal-cell'
      + (isToday    ? ' today'    : '')
      + (isStart || isSingle ? ' selected range-start' : '')
      + (isEnd     ? ' selected range-end'   : '')
      + (isInRange ? ' in-range'             : '')
      + (isSat     ? ' saturday'             : '');

    html += '<div class="' + cls + '" onclick="onCalDay(' + d + ', event)">'
      + '<span>' + d + '</span>'
      + '<span class="shift-dot ' + dotClass + '"></span>'
      + '</div>';
  }

  var calBody = document.getElementById('cal-body');
  if (calBody) calBody.innerHTML = html;
}

function onCalDay(day, evt) {
  var clicked = { y: calYear, m: calMonth, d: day };

  if (evt && evt.shiftKey && selFrom) {
    /* ── Shift+click → set range end ── */
    if (dateCmp(clicked, selFrom) === 0) {
      // Shift+clicked same date → clear
      selFrom = null; selTo = null;
    } else {
      selTo = clicked;
    }
  } else {
    /* ── Normal click ── */
    if (selFrom && !selTo && dateCmp(clicked, selFrom) === 0) {
      // Click same date again → deselect
      selFrom = null; selTo = null;
    } else {
      selFrom = clicked;
      selTo   = null; // reset range end
    }
  }

  /* Resolve active date_from / date_to for API */
  if (!selFrom) {
    // No selection → back to default month range
    currentFilters.date_from = calYear + '-' + pad(calMonth+1) + '-01';
    currentFilters.date_to   = calYear + '-' + pad(calMonth+1) + '-' + pad(new Date(calYear, calMonth+1, 0).getDate());
  } else if (!selTo) {
    // Single date
    currentFilters.date_from = dateToStr(selFrom);
    currentFilters.date_to   = dateToStr(selFrom);
  } else {
    // Range — normalise order
    var a = dateCmp(selFrom, selTo) <= 0 ? selFrom : selTo;
    var b = dateCmp(selFrom, selTo) <= 0 ? selTo   : selFrom;
    currentFilters.date_from = dateToStr(a);
    currentFilters.date_to   = dateToStr(b);
  }

  updateTableTitle();
  fetchAttendance();
}

function updateTableTitle() {
  var title = document.getElementById('att-table-title');
  if (!title) return;
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  if (!selFrom) {
    title.textContent = 'Attendance History';
  } else if (!selTo) {
    var df = new Date(selFrom.y, selFrom.m, selFrom.d);
    title.textContent = 'Attendance — ' + days[df.getDay()] + ', ' + selFrom.d + ' ' + months[selFrom.m] + ' ' + selFrom.y;
  } else {
    var a = dateCmp(selFrom, selTo) <= 0 ? selFrom : selTo;
    var b = dateCmp(selFrom, selTo) <= 0 ? selTo   : selFrom;
    title.textContent = 'Attendance — ' + a.d + ' ' + months[a.m] + (a.y !== b.y ? ' '+a.y : '') + '  –  ' + b.d + ' ' + months[b.m] + ' ' + b.y;
  }
}

/* ══════════════════════════════════════════════
   FILTERS
══════════════════════════════════════════════ */
function onDateFilterChange() {
  var fromEl = document.getElementById('filter-date-from');
  var toEl   = document.getElementById('filter-date-to');
  currentFilters.date_from = fromEl ? fromEl.value : '';
  currentFilters.date_to   = toEl   ? toEl.value   : '';
  updateTableTitle();

  if (currentFilters.date_from) {
    var parts = currentFilters.date_from.split('-');
    calYear  = parseInt(parts[0]);
    calMonth = parseInt(parts[1]) - 1;
  }
  fetchAttendance();
}

function onStatusFilterChange() {
  var el = document.getElementById('filter-status');
  currentFilters.status = el ? el.value : 'all';
  renderAttTable();
}

function resetFilters() {
  selFrom = null;
  selTo   = null;
  currentFilters.status    = 'all';
  currentFilters.date_from = getMonthStartStr();
  currentFilters.date_to   = getTodayStr();

  var d = new Date();
  calYear  = d.getFullYear();
  calMonth = d.getMonth();

  var statusEl = document.getElementById('filter-status');
  if (statusEl) statusEl.value = 'all';

  updateTableTitle();
  fetchAttendance();
}

/* ══════════════════════════════════════════════
   TABLE
══════════════════════════════════════════════ */
function renderAttTable() {
  var rows = apiRecords.slice();

  if (currentFilters.status !== 'all') {
    rows = rows.filter(function(r) { return r.status === currentFilters.status; });
  }

  if (rows.length === 0) {
    showTableMessage('No attendance data found.');
    return;
  }

  var html = rows.map(function(r) {
    var trCls = '';

    var sessionLabel = 'Session ' + (r.session || 1);
    var shiftBadge   = '<span class="shift-badge morning">'
      + '<span class="shift-dot morning" style="width:5px;height:5px;border-radius:50%;flex-shrink:0;display:inline-block;margin-right:4px;vertical-align:middle;"></span>'
      + sessionLabel + '</span>';

    var st     = r.status || 'unknown';
    var cls    = statusCls[st]   || 'pending';
    var lbl    = statusLabel[st] || ('● ' + st);
    var stBadge = '<span class="badge-status ' + cls + '">' + lbl + '</span>';

    var ciTime = formatTime(r.check_in_time);
    var coTime = r.check_out_time ? formatTime(r.check_out_time) : '—';
    var ciCls  = ciTime === '—' ? ' pending-time' : '';
    var coCls  = coTime === '—' ? ' pending-time' : '';

    var attachment = r.face_image
      ? '<button class="btn-view" onclick="openPhotoModal(\'' + r.face_image + '\')">'
        + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> View</button>'
      : '<span class="btn-view-na">None</span>';

    return '<tr' + trCls + '>'
      + '<td class="att-date">'   + formatDateDisplay(r.shift_date) + '</td>'
      + '<td>'                    + shiftBadge + '</td>'
      + '<td class="checkin-time' + ciCls + '">' + ciTime + '</td>'
      + '<td class="checkin-time' + coCls + '">' + coTime + '</td>'
      + '<td>'                    + stBadge + '</td>'
      + '<td>'                    + attachment + '</td>'
      + '</tr>';
  }).join('');

  var tbody = document.getElementById('att-main-tbody');
  if (tbody) tbody.innerHTML = html;

}

/* ══════════════════════════════════════════════
   NEXT SHIFT PANEL
══════════════════════════════════════════════ */
function updateNextShiftPanel() {
  var nameEl = document.getElementById('next-shift-name');
  var timeEl = document.getElementById('next-shift-time');
  if (!nameEl || !timeEl) return;

  var shiftNames = { 1: 'Morning', 2: 'Evening', 3: 'Night' };
  var shiftTimes = { 1: '06:00 – 14:00', 2: '14:00 – 22:00', 3: '22:00 – 06:00' };
  var todayStr   = getTodayStr();

  // Find next upcoming shift: future date first, then today's unstarted record
  var sorted = apiRecords.slice().sort(function(a, b) {
    if (a.shift_date !== b.shift_date) return a.shift_date > b.shift_date ? 1 : -1;
    return (a.session || 1) - (b.session || 1);
  });

  var next = null;
  for (var i = 0; i < sorted.length; i++) {
    var rec = sorted[i];
    if (rec.shift_date > todayStr) { next = rec; break; }
    if (rec.shift_date === todayStr && !rec.check_in_time) { next = rec; break; }
  }

  // Fall back to today's latest record if no upcoming shift found
  if (!next) {
    var todayRecs = recordsByDate[todayStr] || [];
    if (todayRecs.length > 0) next = todayRecs[todayRecs.length - 1];
  }

  if (next) {
    var session   = next.session || 1;
    var dateLabel = next.shift_date === todayStr ? 'Today' : formatDateDisplay(next.shift_date);
    nameEl.textContent = shiftNames[session] || ('Session ' + session);
    timeEl.textContent = dateLabel + ', ' + (shiftTimes[session] || '');
  } else {
    nameEl.textContent = '—';
    timeEl.textContent = 'No upcoming shifts';
  }
}

/* ══════════════════════════════════════════════
   PHOTO MODAL (simple)
══════════════════════════════════════════════ */
function openPhotoModal(imageUrl) {
  var overlay = document.getElementById('modal-overlay');
  if (!overlay) return;

  document.getElementById('modal-title').textContent    = 'Attendance Photo';
  document.getElementById('modal-subtitle').textContent = 'Face Recognition';

  var ci1Wrap  = document.getElementById('photo-ci1-wrap');
  var ci1Inner = ci1Wrap ? ci1Wrap.querySelector('.photo-inner') : null;
  if (ci1Inner) {
    ci1Inner.innerHTML = '<img src="' + imageUrl + '" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" alt="Attendance photo">';
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  var overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });
