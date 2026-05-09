/* ══════════════════════════════════════════════
  DASHBOARD RENDER FUNCTIONS (shared)
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

var MAX_ROWS = 5;

function buildAttendanceRows(records, role) {
  if (role === 'team') {
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

    return Object.values(grouped).slice(0, MAX_ROWS).map(function(u) {
      return {
        name: u.name,
        role: u.role,
        checkIn1: u.c1,
        checkIn2: u.c2,
        status: u.status
      };
    });
  } else {
    return records.slice(0, MAX_ROWS).map(function(p) {
      var name = p.user_name || p.name || 'Unknown';
      var rawRole = p.user_role || p.role || role;
      var clockIn = p.clock_in_time || p.check_in_time || p.clockIn || '--:--';
      var clockOut = p.clock_out_time || p.check_out_time || p.clockOut || '--:--';

      if (clockIn.includes(' ')) clockIn = clockIn.split(' ')[1].substring(0, 5);
      if (clockOut.includes(' ')) clockOut = clockOut.split(' ')[1].substring(0, 5);

      return {
        name: name,
        role: rawRole,
        checkInTime: clockIn,
        checkOutTime: clockOut,
        status: p.status || 'pending'
      };
    });
  }
}

function buildBirthdayRows(records) {
  return records.slice(0, MAX_ROWS).map(function(p) {
    var name = p.name || 'Unknown';
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
      role: p.role || '',
      department: dept,
      birthDate: formattedDate
    };
  });
}

function buildLeaveRows(records) {
  return records.slice(0, MAX_ROWS).map(function(p) {
    var name = p.user_name || p.name || 'Unknown';
    var rawRole = p.user_role || p.role || '';
    var type = p.leave_type || p.type || '-';
    var fromDate = p.leave_date_from || p.start_date || p.from_date || p.from || '';
    var toDate = p.leave_date_to || p.end_date || p.to_date || p.to || '';
    var status = p.status || 'pending';

    var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var formatD = function(dStr) {
      if (!dStr) return '';
      var d = new Date(dStr.replace(' ', 'T').split('T')[0] + 'T00:00:00Z');
      if (isNaN(d)) return dStr;
      return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
    };
    var formattedFrom = formatD(fromDate);
    var formattedTo = formatD(toDate);
    var dateRange = formattedFrom && formattedTo && formattedFrom !== formattedTo
      ? formattedFrom + ' – ' + formattedTo
      : (formattedFrom || formattedTo || '-');

    return {
      name: name,
      role: rawRole,
      leaveType: type,
      dateRange: dateRange,
      status: status
    };
  });
}
