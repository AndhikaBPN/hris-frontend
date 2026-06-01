/* ══════════════════════════════════════════════
   EMPLOYEE RENDER FUNCTIONS
   Depends on: getInitials(), getColorByIndex() from render/team.js
══════════════════════════════════════════════ */

var ROLE_BADGE_MAP = {
  c_level:           { label: 'C-Level',      colorClass: 'role-clevel' },
  hrd_manager:       { label: 'HRD Manager',  colorClass: 'role-hrd'    },
  technical_manager: { label: 'Tech Manager', colorClass: 'role-tech'   },
  team_leader:       { label: 'Team Leader',  colorClass: 'role-lead'   },
  staff:             { label: 'Staff',        colorClass: 'role-staff'  }
};

function buildRoleBadgeData(role) {
  return ROLE_BADGE_MAP[role] || { label: role || '—', colorClass: 'role-staff' };
}

function buildStatusBadgeData(isActive) {
  return isActive
    ? { label: 'Active',   colorClass: 'status-active'   }
    : { label: 'Inactive', colorClass: 'status-inactive' };
}

function mapUserData(users) {
  return (users || []).map(function(u, idx) {
    var color = getColorByIndex(idx);
    return {
      id:         u.id,
      name:       u.name  || '—',
      email:      u.email || '—',
      role:       u.role  || 'staff',
      isActive:   u.is_active === true || u.is_active === 1,
      managerId:  u.manager_id || null,
      initials:   getInitials(u.name || ''),
      avatarBg:   color.bg,
      avatarColor: color.text,
      roleBadge:   buildRoleBadgeData(u.role),
      statusBadge: buildStatusBadgeData(u.is_active === true || u.is_active === 1)
    };
  });
}

function buildUserRows(mappedUsers) {
  return (mappedUsers || []).map(function(u) {
    return {
      id:          u.id,
      name:        u.name,
      email:       u.email,
      initials:    u.initials,
      avatarBg:    u.avatarBg,
      avatarColor: u.avatarColor,
      roleBadge:   u.roleBadge,
      statusBadge: u.statusBadge,
      editData: {
        id:        u.id,
        name:      u.name,
        email:     u.email,
        role:      u.role,
        managerId: u.managerId,
        isActive:  u.isActive
      },
      deleteData: {
        id:   u.id,
        name: u.name
      }
    };
  });
}

function buildStatCounts(mappedUsers, meta) {
  var total   = (meta && meta.total) ? meta.total : (mappedUsers ? mappedUsers.length : 0);
  var active  = 0;
  var managers = 0;
  var staffAndLeaders = 0;
  var managerRoles = ['c_level', 'hrd_manager', 'technical_manager'];

  (mappedUsers || []).forEach(function(u) {
    if (u.isActive) active++;
    if (managerRoles.indexOf(u.role) !== -1) managers++;
    else staffAndLeaders++;
  });

  return { total: total, active: active, managers: managers, staffAndLeaders: staffAndLeaders };
}
