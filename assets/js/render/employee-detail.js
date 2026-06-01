/* ══════════════════════════════════════════════
   EMPLOYEE DETAIL RENDER FUNCTIONS
   Depends on: buildRoleBadgeData(), buildStatusBadgeData() from render/employee.js
               getInitials(), getColorByIndex() from render/team.js
══════════════════════════════════════════════ */

function mapEmployeeDetailData(raw) {
  if (!raw) return null;

  var isActive = raw.is_active === true || raw.is_active === 1;
  var role     = raw.role || '';

  return {
    id:           raw.id || null,
    name:         raw.name         || '—',
    email:        raw.email        || '—',
    birthDate:    raw.birth_date   || null,
    role:         role,
    roleId:       raw.role_id      || null,
    isActive:     isActive,
    managerId:    raw.manager_id   || null,
    managerName:  raw.manager_name || null,
    teamId:       raw.team_id      || null,
    teamName:     raw.team_name    || null,
    photoProfile: raw.photo_profile || null,

    /* display helpers */
    initials:    getInitials(raw.name || ''),
    avatarBg:    getColorByIndex(0).bg,
    avatarColor: getColorByIndex(0).text,
    roleBadge:   buildRoleBadgeData(role),
    statusBadge: buildStatusBadgeData(isActive),
    birthDateDisplay: formatBirthDate(raw.birth_date)
  };
}

function formatBirthDate(dateStr) {
  if (!dateStr) return '—';
  var d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
