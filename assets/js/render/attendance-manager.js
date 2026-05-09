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
    var total = r.total_valid + r.total_late + r.total_invalid + r.total_leave;
    var rate = total > 0 ? Math.round((r.total_valid / total) * 100) : 0;
    var barColor = rate >= 90 ? '#2e7d4f' : rate >= 70 ? '#f39c12' : '#c0392b';

    return {
      userName: r.user_name || 'Unknown',
      userRole: r.user_role || '',
      total: total,
      valid: r.total_valid,
      late: r.total_late || 0,
      invalid: r.total_invalid || 0,
      leave: r.total_leave || 0,
      rate: rate,
      barColor: barColor
    };
  });
}

function buildTeamAttendanceRows(records) {
  var grouped = {};
  records.forEach(function(p) {
    var uid = p.user_id;
    if (!grouped[uid]) {
      grouped[uid] = {
        name: p.user_name || p.name,
        role: p.user_role || p.role,
        c1: '--:--',
        c2: '--:--',
        status: p.status
      };
    }
    var time = p.check_in_time || p.clock_in_time;
    if (time && time.includes(' ')) time = time.split(' ')[1].substring(0, 5);

    if (p.session == 1) grouped[uid].c1 = time;
    else if (p.session == 2) grouped[uid].c2 = time;
  });

  return Object.values(grouped).map(function(u) {
    return {
      name: u.name,
      role: u.role,
      checkInSession1: u.c1,
      checkInSession2: u.c2,
      status: u.status
    };
  });
}

function buildPersonalAttendanceRows(records) {
  return records.map(function(p) {
    var clockIn = p.clock_in_time || p.check_in_time || p.clockIn || '--:--';
    var clockOut = p.clock_out_time || p.check_out_time || p.clockOut || '--:--';

    if (clockIn.includes(' ')) clockIn = clockIn.split(' ')[1].substring(0, 5);
    if (clockOut.includes(' ')) clockOut = clockOut.split(' ')[1].substring(0, 5);

    return {
      name: p.user_name || p.name || 'Unknown',
      role: p.user_role || p.role || '',
      checkInTime: clockIn,
      checkOutTime: clockOut,
      status: p.status || 'pending'
    };
  });
}
