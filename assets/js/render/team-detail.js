/* ══════════════════════════════════════════════
  TEAM DETAIL RENDER FUNCTIONS
══════════════════════════════════════════════ */

var ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>';

function getColorByIndex(i) {
  var colors = ['#3d5c45', '#8b6db3', '#d9534f', '#2980b9', '#27ae60', '#f39c12'];
  return colors[i % colors.length];
}

function getInitials(name) {
  return name ? name.split(' ').map(function(n) { return n[0]; }).join('').toUpperCase() : '?';
}

function buildTeamHeroData(teamData) {
  return {
    label: (teamData.division || 'TEAM').toUpperCase(),
    name: teamData.team_name || teamData.name || 'Unknown Team',
    leadName: teamData.lead_name || teamData.team_lead_name || 'Unknown',
    leadRole: teamData.lead_role || 'Team Lead',
    leadInitials: getInitials(teamData.lead_name || teamData.team_lead_name || '?'),
    leadColor: teamData.lead_color || getColorByIndex(0)
  };
}

function buildTeamStatsData(teamData, memberCount) {
  return {
    totalMembers: memberCount || 0,
    growth: teamData.growth || '+0 this month',
    retentionRate: teamData.retention_rate || 0,
    performanceScore: teamData.performance_score || 0
  };
}

function buildRosterPreview(members) {
  return (members || []).slice(0, 4).map(function(m) {
    return {
      initials: m.initials || getInitials(m.name || m.user_name || '?'),
      color: m.color || getColorByIndex(members.indexOf(m)),
      name: m.name || m.user_name || 'Unknown',
      role: m.role || m.user_role || 'Member',
      joinDate: m.join_date || m.joinDate || '-',
      status: m.status || 'active'
    };
  });
}

function buildRosterExpanded(members) {
  return (members || []).map(function(m) {
    return {
      initials: m.initials || getInitials(m.name || m.user_name || '?'),
      color: m.color || getColorByIndex(members.indexOf(m)),
      name: m.name || m.user_name || 'Unknown',
      role: m.role || m.user_role || 'Member',
      email: m.email || m.user_email || '-',
      joinDate: m.join_date || m.joinDate || '-',
      status: m.status || 'active'
    };
  });
}

function buildProjectsList(projects) {
  return (projects || []).map(function(p) {
    return {
      name: p.name || 'Unknown',
      percentage: p.progress || p.pct || 0,
      description: p.description || p.desc || '-'
    };
  });
}

function buildActivityList(activities) {
  return (activities || []).map(function(a) {
    return {
      text: a.text || a.activity || '-',
      meta: a.meta || a.timestamp || '-',
      icon: ICON_SVG
    };
  });
}
