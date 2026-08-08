/* ══════════════════════════════════════════════
  ATTENDANCE MANAGER RENDER FUNCTIONS
══════════════════════════════════════════════ */

var STATUS_MAP_MANAGER = {
  'valid': { label: '● Valid', color: '#2e7d4f' },
  'late': { label: '● Late', color: '#b06000' },
  'invalid': { label: '● Invalid', color: '#c0392b' },
  'leave': { label: '● Leave', color: '#2980b9' },
  'sick-leave': { label: '● Sick Leave', color: '#2980b9' },
  'permit': { label: '● Permit', color: '#2980b9' }
};

function buildSummaryCards(teamAttendanceData) {
  var stats = {
    hadir: 0,
    late: 0,
    absent: 0,
    cuti: 0,
    total: 0
  };

  teamAttendanceData.forEach(function(r) {
    stats.total++;
    if (r.status === 'valid') stats.hadir++;
    else if (r.status === 'late') stats.late++;
    else if (r.status === 'leave' || r.status === 'sick-leave' || r.status === 'permit') stats.cuti++;
    else if (r.status === 'invalid') stats.absent++;
  });

  var rate = stats.total > 0 ? Math.round(((stats.hadir + stats.late) / stats.total) * 100) : 0;

  return {
    hadir: stats.hadir,
    late: stats.late,
    absent: stats.absent,
    cuti: stats.cuti,
    rate: rate
  };
}

function getStatusLabel(status) {
  return STATUS_MAP_MANAGER[status] || { label: '● Pending', color: '#95a5a6' };
}

function formatTimeForManager(timeStr) {
  if (!timeStr || timeStr === '--:--') return '--:--';
  if (timeStr.includes(' ')) return timeStr.split(' ')[1].substring(0, 5);
  return timeStr;
}

function buildSummaryRows(summaryData) {
  return summaryData.map(function(r) {
    var total = (r.total_valid || 0) + (r.total_late || 0) + (r.total_invalid || 0) + (r.total_leave || 0);
    var rate = r.rate || 0;
    var barColor = rate >= 90 ? '#2e7d4f' : rate >= 70 ? '#f39c12' : '#c0392b';

    return {
      userName: r.user_name || 'Unknown',
      userRole: r.user_role || '',
      total: r.total_working_days || total,
      valid: r.total_valid || 0,
      late: r.total_late || 0,
      invalid: r.total_invalid || 0,
      leave: r.total_leave || 0,
      rate: rate,
      barColor: barColor
    };
  });
}

function _calcDuration(rawIn, rawOut) {
  if (!rawIn || !rawOut) return '—';
  var tIn  = new Date(rawIn.replace(' ', 'T'));
  var tOut = new Date(rawOut.replace(' ', 'T'));
  if (isNaN(tIn) || isNaN(tOut) || tOut <= tIn) return '—';
  var mins = Math.round((tOut - tIn) / 60000);
  var h = Math.floor(mins / 60);
  var m = mins % 60;
  return h + 'h ' + (m < 10 ? '0' : '') + m + 'm';
}

function buildTeamAttendanceRows(records) {
  var grouped = {};
  records.forEach(function(p) {
    var uid = p.user_id;
    if (!grouped[uid]) {
      grouped[uid] = {
        name:            p.user_name  || p.name  || '—',
        division:        p.team_name  || p.division || p.user_role || '—',
        c1:              '--:--',
        c2:              '--:--',
        rawIn1:          null,
        rawOut:          null,
        status:          p.status     || 'pending',
        faceImg:         null,
        shiftScheduleId: p.shift_schedule_id || null
      };
    }
    var rawIn  = p.check_in_time  || p.clock_in_time  || '';
    var rawOut = p.check_out_time || p.clock_out_time || '';
    var time = rawIn && rawIn.includes(' ') ? rawIn.split(' ')[1].substring(0, 5) : rawIn;

    if (p.session == 1) {
      grouped[uid].c1      = time || '--:--';
      grouped[uid].rawIn1  = rawIn  || null;
      grouped[uid].rawOut  = rawOut || null;
      grouped[uid].status  = p.status || grouped[uid].status;
      grouped[uid].faceImg = p.face_image || null;
    } else if (p.session == 2) {
      grouped[uid].c2     = time || '--:--';
      if (rawOut) grouped[uid].rawOut = rawOut;
    }
  });

  return Object.values(grouped).map(function(u) {
    return {
      name:            u.name,
      division:        u.division,
      checkInSession1: u.c1,
      checkInSession2: u.c2,
      duration:        _calcDuration(u.rawIn1, u.rawOut),
      status:          u.status,
      faceImg:         u.faceImg,
      shiftScheduleId: u.shiftScheduleId
    };
  });
}

function buildPersonalAttendanceRows(records) {
  var _userRole = (JSON.parse(localStorage.getItem('hris_user') || '{}').role) || '';
  var _roleShift = _userRole === 'hrd_manager' ? 'HRD' : _userRole === 'technical_manager' ? 'Technical' : null;
  return records.map(function(p) {
    var rawIn  = p.check_in_time  || p.clock_in_time  || p.clockIn  || '';
    var rawOut = p.check_out_time || p.clock_out_time || p.clockOut || '';

    var clockIn  = rawIn  ? rawIn.includes(' ')  ? rawIn.split(' ')[1].substring(0, 5)  : rawIn  : '--:--';
    var clockOut = rawOut ? rawOut.includes(' ') ? rawOut.split(' ')[1].substring(0, 5) : rawOut : '--:--';

    // date from shift_date or date portion of check_in_time
    var dateRaw = p.shift_date || (rawIn ? rawIn.split(' ')[0] : '');
    var dateLabel = dateRaw ? (function() {
      var d = new Date(dateRaw + 'T00:00:00');
      return isNaN(d) ? dateRaw : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    })() : '-';

    // shift: prefer shift_name from API, fallback to role-based name for managers
    var shiftLabel = p.shift_name || _roleShift || (p.session ? 'Session ' + p.session : '-');

    // duration: calc from check_in to check_out
    var duration = '-';
    if (rawIn && rawOut) {
      var tIn  = new Date(rawIn.replace(' ', 'T'));
      var tOut = new Date(rawOut.replace(' ', 'T'));
      if (!isNaN(tIn) && !isNaN(tOut) && tOut > tIn) {
        var mins = Math.round((tOut - tIn) / 60000);
        var h = Math.floor(mins / 60);
        var m = mins % 60;
        duration = h + 'h ' + (m < 10 ? '0' : '') + m + 'm';
      }
    }

    return {
      date:            dateLabel,
      shift:           shiftLabel,
      checkInTime:     clockIn,
      checkOutTime:    clockOut,
      duration:        duration,
      status:          p.status || 'pending',
      name:            p.user_name || p.name || 'Unknown',
      role:            p.user_role || p.role || '',
      shiftScheduleId: p.shift_schedule_id || null
    };
  });
}
