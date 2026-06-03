/* ══════════════════════════════════════════════
   LEAVE REQUEST — RENDER LAYER
   Returns data objects only — no HTML generation
══════════════════════════════════════════════ */

var LEAVE_TYPE_CFG = {
  annual:           { label: 'Annual Leave',       cls: 'leave-type-annual'    },
  sick:             { label: 'Sick',               cls: 'leave-type-sick'      },
  permit:           { label: 'Permit',             cls: 'leave-type-permit'    },
  leave_of_absence: { label: 'Leave of Absence',   cls: 'leave-type-absence'   }
};

var LEAVE_STATUS_CFG = {
  pending:  { label: 'Pending',  cls: 'leave-status-pending'  },
  approved: { label: 'Approved', cls: 'leave-status-approved' },
  rejected: { label: 'Rejected', cls: 'leave-status-rejected' }
};

function getLeaveTypeBadge(type) {
  return LEAVE_TYPE_CFG[(type || '').toLowerCase()] || { label: type || '—', cls: 'leave-type-annual' };
}

function getLeaveStatusBadge(status) {
  return LEAVE_STATUS_CFG[(status || '').toLowerCase()] || { label: status || '—', cls: 'leave-status-pending' };
}

function formatLeaveDate(dateStr) {
  if (!dateStr) return '—';
  var d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatLeaveDateRange(dateFrom, dateTo) {
  if (!dateFrom) return '—';
  if (!dateTo || dateFrom === dateTo) return formatLeaveDate(dateFrom);
  return formatLeaveDate(dateFrom) + ' – ' + formatLeaveDate(dateTo);
}

function countLeaveDays(dateFrom, dateTo) {
  if (!dateFrom) return 0;
  var from = new Date(dateFrom);
  var to   = dateTo ? new Date(dateTo) : from;
  if (isNaN(from.getTime()) || isNaN(to.getTime())) return 0;
  return Math.round((to - from) / (1000 * 60 * 60 * 24)) + 1;
}

function mapLeaveRow(raw) {
  if (!raw) return null;
  var type   = (raw.leave_type || raw.type || '').toLowerCase();
  var status = (raw.status || '').toLowerCase();
  return {
    id:           raw.id,
    name:         raw.user_name || raw.employee_name || raw.name || '—',
    team:         raw.team_name || raw.team || '—',
    dateFrom:     raw.leave_date_from || raw.date_from || '',
    dateTo:       raw.leave_date_to   || raw.date_to   || '',
    dateDisplay:  formatLeaveDateRange(raw.leave_date_from || raw.date_from, raw.leave_date_to || raw.date_to),
    days:         countLeaveDays(raw.leave_date_from || raw.date_from, raw.leave_date_to || raw.date_to),
    type:         type,
    status:       status,
    reason:       raw.reason        || '',
    doctorLetter: raw.doctor_letter || '',
    managerName:  raw.manager_name  || raw.approved_by || '',
    createdAt:    raw.created_at    || '',
    typeBadge:    getLeaveTypeBadge(type),
    statusBadge:  getLeaveStatusBadge(status),
    canCancel:    status === 'pending'
  };
}

function mapLeaveList(rawList) {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(mapLeaveRow).filter(Boolean);
}

function mapLeaveSummary(raw) {
  if (!raw) return { currYearRemaining: 0, used: 0, totalThisYear: 0 };
  return {
    currYearRemaining: raw.remaining_quota  || raw.curr_year_remaining || 0,
    used:              raw.total_used       || raw.used_days           || 0,
    totalThisYear:     raw.total_quota      || raw.total               || 0
  };
}

function mapLeaveDetail(raw) {
  if (!raw) return null;
  var row = mapLeaveRow(raw);
  if (!row) return null;
  row.employeeId   = raw.employee_id || raw.user_id || '';
  row.managerId    = raw.manager_id  || '';
  row.rejectReason = raw.reject_reason || raw.rejection_reason || '';
  row.updatedAt    = raw.updated_at    || '';
  return row;
}
