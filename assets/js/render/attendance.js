/* ══════════════════════════════════════════════
  ATTENDANCE RENDER & UTILITY FUNCTIONS
══════════════════════════════════════════════ */

var statusCls = { valid:'complete', late:'late', invalid:'pending', on_leave:'approved', leave:'approved', 'sick-leave':'approved', permit:'approved' };
var statusLabel = { valid:'● Valid', late:'● Late', invalid:'● Invalid', on_leave:'● On Leave', leave:'● Leave', 'sick-leave':'● Sick Leave', permit:'● Permit' };
var shiftNameMap = { 'Pagi': 'Morning', 'Siang': 'Afternoon', 'Malam': 'Night', 'Off': 'Day Off' };

function pad(n) { return n < 10 ? '0'+n : ''+n; }

function dateCmp(a, b) {
  if (a.y !== b.y) return a.y - b.y;
  if (a.m !== b.m) return a.m - b.m;
  return a.d - b.d;
}

function dateToStr(o) { return o.y + '-' + pad(o.m+1) + '-' + pad(o.d); }

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
  var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()];
}

function getShiftDotClass(s) {
  if (s.is_day_off) return 'dayoff';
  var h = parseInt(s.start_time.split(':')[0]);
  if (h >= 6 && h < 14) return 'morning';
  if (h >= 14 && h < 22) return 'evening';
  return 'night';
}

function buildCalendarCells(year, month, recordsByDate, shiftsByDate) {
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var firstWeekday = new Date(year, month, 1).getDay();
  var daysInMonth = new Date(year, month+1, 0).getDate();
  var today = new Date();

  var cells = [];
  for (var i = 0; i < firstWeekday; i++) {
    cells.push({ type: 'empty' });
  }

  for (var d = 1; d <= daysInMonth; d++) {
    var dateStr = year + '-' + pad(month+1) + '-' + pad(d);
    var isToday = year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
    var isSat = new Date(year, month, d).getDay() === 6;
    var records = recordsByDate[dateStr] || [];

    var dotClass = 'none';
    var shiftRec = shiftsByDate[dateStr];
    if (shiftRec) {
      dotClass = getShiftDotClass(shiftRec);
    } else if (records.length > 0) {
      if (records.some(function(r) { return r.status === 'invalid'; })) dotClass = 'night';
      else if (records.some(function(r) { return r.status === 'late'; })) dotClass = 'evening';
      else dotClass = 'morning';
    }

    cells.push({
      type: 'day',
      day: d,
      dateStr: dateStr,
      isToday: isToday,
      isSat: isSat,
      dotClass: dotClass
    });
  }
  return cells;
}

function buildAttendanceRows(records, statusFilter) {
  var rows = records.slice();
  if (statusFilter !== 'all') {
    rows = rows.filter(function(r) { return r.status === statusFilter; });
  }

  return rows.map(function(r) {
    var sessionLabel = 'Session ' + (r.session || 1);
    var st = r.status || 'unknown';
    var cls = statusCls[st] || 'pending';
    var lbl = statusLabel[st] || ('● ' + st);
    var ciTime = formatTime(r.check_in_time);
    var coTime = r.check_out_time ? formatTime(r.check_out_time) : '—';

    return {
      shiftDate: r.shift_date,
      sessionLabel: sessionLabel,
      statusClass: cls,
      statusLabel: lbl,
      checkInTime: ciTime,
      checkOutTime: coTime,
      checkInClass: ciTime === '—' ? 'pending-time' : '',
      checkOutClass: coTime === '—' ? 'pending-time' : '',
      faceImage: r.face_image
    };
  });
}

function buildNextShiftInfo(shiftsByDate) {
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var tomorrowStr = tomorrow.getFullYear() + '-' + pad(tomorrow.getMonth() + 1) + '-' + pad(tomorrow.getDate());

  var shift = shiftsByDate[tomorrowStr];
  if (shift) {
    if (shift.is_day_off) {
      return {
        name: 'Day Off',
        time: formatDateDisplay(tomorrowStr)
      };
    } else {
      var startTime = shift.start_time.substring(0, 5);
      var endTime = shift.end_time.substring(0, 5);
      return {
        name: shiftNameMap[shift.shift_name] || shift.shift_name,
        time: formatDateDisplay(tomorrowStr) + ', ' + startTime + ' – ' + endTime
      };
    }
  }
  return {
    name: '—',
    time: 'No shift scheduled'
  };
}
