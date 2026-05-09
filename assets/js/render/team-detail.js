/* ══════════════════════════════════════════════
  TEAM DETAIL RENDER FUNCTIONS
══════════════════════════════════════════════ */

var ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>';

function buildRosterPreview(members, query) {
  var rows = query
    ? members.filter(function(m) { return m.name.toLowerCase().includes(query.toLowerCase()) || m.role.toLowerCase().includes(query.toLowerCase()); })
    : members;
  return rows.slice(0, 4).map(function(m) {
    return {
      initials: m.initials,
      color: m.color,
      name: m.name,
      role: m.role,
      joinDate: m.joinDate,
      status: m.status
    };
  });
}

function buildRosterExpanded(members, query) {
  var rows = query
    ? members.filter(function(m) { return m.name.toLowerCase().includes(query.toLowerCase()) || m.role.toLowerCase().includes(query.toLowerCase()); })
    : members;
  return rows.map(function(m) {
    return {
      initials: m.initials,
      color: m.color,
      name: m.name,
      role: m.role,
      email: m.email,
      joinDate: m.joinDate,
      status: m.status
    };
  });
}

function buildProjectsList(projects) {
  return (projects || []).map(function(p) {
    return {
      name: p.name,
      percentage: p.pct,
      description: p.desc
    };
  });
}

function buildActivityList(activities) {
  return (activities || []).map(function(a) {
    return {
      text: a.text,
      meta: a.meta,
      icon: ICON_SVG
    };
  });
}
