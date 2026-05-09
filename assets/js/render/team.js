/* ══════════════════════════════════════════════
  TEAM RENDER FUNCTIONS (Return data objects, not HTML)
══════════════════════════════════════════════ */

var COLORS = [
  { bg: '#e8f5ec', text: '#3d5c45' },
  { bg: '#f0eafb', text: '#7d5a9a' },
  { bg: '#e6f0fb', text: '#2980b9' },
  { bg: '#fff4e5', text: '#b06000' },
  { bg: '#fdecea', text: '#c0392b' }
];

function getColorByIndex(idx) {
  return COLORS[idx % COLORS.length];
}

function getInitials(name) {
  if (!name) return '';
  var parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + (parts[parts.length - 1][0] || '')).toUpperCase();
}

function mapTeamData(teams) {
  return teams.map(function(t, idx) {
    var color = getColorByIndex(idx);
    var initials = getInitials(t.team_lead_name);
    return {
      id: t.id,
      name: t.team_name || '',
      division: '',
      leadName: t.team_lead_name || '',
      leadInitials: initials,
      leadColor: 'linear-gradient(135deg,' + color.bg + ',' + color.text + ')',
      leadRole: '',
      members: '',
      function: '',
      iconBg: color.bg,
      iconColor: color.text,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
      retention: '',
      perf: '',
      growth: '',
      desc: ''
    };
  });
}

function buildTeamRows(teamsData, canManage) {
  return teamsData.map(function(t) {
    var actions = canManage ? {
      edit: { id: t.id, name: t.name },
      delete: { id: t.id, name: t.name }
    } : null;

    return {
      id: t.id,
      classNames: canManage ? '' : 'team-row--no-actions',
      href: 'team-detail.html?id=' + t.id,
      iconBg: t.iconBg,
      iconColor: t.iconColor,
      icon: t.icon,
      name: t.name,
      division: t.division,
      leadColor: t.leadColor,
      leadInitials: t.leadInitials,
      leadName: t.leadName,
      members: t.members,
      actions: actions
    };
  });
}
