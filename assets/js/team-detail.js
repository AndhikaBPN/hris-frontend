/* ══ MEMBERS DATA ══ */
var MEMBERS = {
  1: [
    { initials:'AR', name:'Alex Rivera',  email:'alex@sanctuary.io',   role:'Backend Engineer',   joinDate:'Oct 12, 2021', status:'active', color:'linear-gradient(135deg,#3d5c45,#6dbf80)' },
    { initials:'RW', name:'Ryan Wijaya',  email:'ryan@sanctuary.io',   role:'Frontend Engineer',  joinDate:'Jan 05, 2022', status:'active', color:'linear-gradient(135deg,#b07830,#d4a860)' },
    { initials:'BK', name:'Budi Kurnia',  email:'budi@sanctuary.io',   role:'Systems DevOps',     joinDate:'May 22, 2023', status:'remote', color:'linear-gradient(135deg,#8e44ad,#bb8fce)' },
    { initials:'JL', name:'Jordan Lee',   email:'jordan@sanctuary.io', role:'QA Engineer',        joinDate:'Jun 30, 2023', status:'active', color:'linear-gradient(135deg,#c0392b,#e07060)' },
    { initials:'TK', name:'Toni Kusuma',  email:'toni@sanctuary.io',   role:'Senior Backend',     joinDate:'Mar 10, 2021', status:'active', color:'linear-gradient(135deg,#e67e22,#f39c12)' },
    { initials:'FN', name:'Fahmi N.',     email:'fahmi@sanctuary.io',  role:'Cloud Architect',    joinDate:'Aug 01, 2022', status:'remote', color:'linear-gradient(135deg,#7d5a9a,#b08bc0)' },
  ],
  2: [
    { initials:'MP', name:'Maya Putri',   email:'maya@sanctuary.io',   role:'Senior UI Designer', joinDate:'Feb 14, 2022', status:'active', color:'linear-gradient(135deg,#7d5a9a,#b08bc0)' },
    { initials:'DN', name:'Diana Nas',    email:'diana@sanctuary.io',  role:'UX Researcher',      joinDate:'Jul 20, 2022', status:'active', color:'linear-gradient(135deg,#2980b9,#5dade2)' },
    { initials:'LS', name:'Lisa S.',      email:'lisa@sanctuary.io',   role:'Motion Designer',    joinDate:'Nov 03, 2022', status:'leave',  color:'linear-gradient(135deg,#16a085,#48c9b0)' },
  ],
  3: [
    { initials:'LS', name:'Lisa Santoso', email:'lisa@sanctuary.io',   role:'HR Specialist',      joinDate:'Sep 01, 2021', status:'active', color:'linear-gradient(135deg,#16a085,#48c9b0)' },
    { initials:'FR', name:'Fina Rahma',   email:'fina@sanctuary.io',   role:'Recruitment Lead',   joinDate:'Mar 15, 2022', status:'active', color:'linear-gradient(135deg,#c0392b,#e74c3c)' },
  ],
  4: [
    { initials:'SC', name:'Sam Chen',     email:'sam@sanctuary.io',    role:'Data Analyst',       joinDate:'Apr 10, 2022', status:'active', color:'linear-gradient(135deg,#4a6080,#7a9abf)' },
    { initials:'TK', name:'Toni K.',      email:'toni@sanctuary.io',   role:'Data Engineer',      joinDate:'Jan 20, 2023', status:'remote', color:'linear-gradient(135deg,#e67e22,#f39c12)' },
    { initials:'AR', name:'Ara Riani',    email:'ara@sanctuary.io',    role:'ML Engineer',        joinDate:'Jun 01, 2023', status:'active', color:'linear-gradient(135deg,#3d5c45,#6dbf80)' },
  ],
  5: [
    { initials:'BK', name:'Budi Kurnia',  email:'budi@sanctuary.io',   role:'DevOps Lead',        joinDate:'May 22, 2022', status:'active', color:'linear-gradient(135deg,#8e44ad,#bb8fce)' },
    { initials:'RW', name:'Rino Wibowo',  email:'rino@sanctuary.io',   role:'SRE Engineer',       joinDate:'Oct 10, 2022', status:'active', color:'linear-gradient(135deg,#2980b9,#5dade2)' },
  ],
  6: [
    { initials:'DN', name:'Diana Nas',    email:'diana@sanctuary.io',  role:'Product Manager',    joinDate:'Feb 01, 2022', status:'active', color:'linear-gradient(135deg,#2980b9,#5dade2)' },
    { initials:'MP', name:'Mira Purnama', email:'mira@sanctuary.io',   role:'Product Analyst',    joinDate:'Jul 15, 2022', status:'active', color:'linear-gradient(135deg,#7d5a9a,#b08bc0)' },
    { initials:'FR', name:'Fariz R.',     email:'fariz@sanctuary.io',  role:'Business Analyst',   joinDate:'Nov 20, 2022', status:'remote', color:'linear-gradient(135deg,#c0392b,#e74c3c)' },
  ],
};

var PROJECTS = {
  1: [{ name:'Nexus Integration', pct:72, desc:'Scaling the internal message bus to handle 10M events per second.' }, { name:'Shield Protocol', pct:30, desc:'Updating end-to-end encryption for all player communication channels.' }],
  2: [{ name:'Design System v3',  pct:85, desc:'Rebuilding the component library with new accessibility standards.' }, { name:'Mobile Redesign', pct:45, desc:'Full redesign of the mobile app user experience.' }],
  3: [{ name:'Talent Pipeline Q4',pct:60, desc:'Recruiting 20 new engineers for Q4 expansion.' }],
  4: [{ name:'BI Dashboard',      pct:78, desc:'Real-time business intelligence dashboard for executives.' }, { name:'Data Lake Setup', pct:40, desc:'Migrating all data pipelines to the new data lake architecture.' }],
  5: [{ name:'K8s Migration',     pct:55, desc:'Moving all services to Kubernetes for better scalability.' }, { name:'CI/CD Overhaul', pct:90, desc:'Upgrading CI/CD pipeline for faster deployments.' }],
  6: [{ name:'Q4 Roadmap',        pct:65, desc:'Finalizing product roadmap and OKRs for Q4 2023.' }, { name:'Market Research', pct:80, desc:'Competitive analysis and user research for new features.' }],
};

var ACTIVITIES = {
  1: [{ text:'Sprint 42 deployed', meta:'2 hours ago · Automated Release' }, { text:'Budi Kurnia joined Alpha', meta:'Yesterday · Engineering Hub' }, { text:'98% Retention Milestone', meta:'3 days ago · System Alert' }],
  2: [{ text:'Design System v3 preview', meta:'1 hour ago · Figma Sync' }, { text:'New designer onboarded', meta:'2 days ago · HR System' }],
  3: [{ text:'3 candidates shortlisted', meta:'Today · Recruitment System' }, { text:'Onboarding batch completed', meta:'3 days ago · HR Alert' }],
  4: [{ text:'BI pipeline deployed', meta:'3 hours ago · Data System' }, { text:'Data quality check passed', meta:'Yesterday · Monitoring' }],
  5: [{ text:'K8s cluster upgraded', meta:'1 hour ago · Infrastructure' }, { text:'99.9% uptime this month', meta:'Today · SLA Report' }],
  6: [{ text:'Q4 roadmap approved', meta:'Today · Product Board' }, { text:'New product analyst joined', meta:'4 days ago · HR System' }],
};

var ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>';

/* ══ STATE ══ */
var team    = null;
var members = [];

/* ══ INIT ══ */
window.addEventListener('load', function() {
  var id = parseInt(new URLSearchParams(window.location.search).get('id')) || 1;
  team   = TEAMS.find(function(t) { return t.id === id; }) || TEAMS[0];
  members = (MEMBERS[team.id] || []).slice();

  if (CAN_MANAGE) {
    var btn = document.getElementById('btn-edit');
    if (btn) btn.style.display = 'inline-flex';
  }

  /* Hero */
  setText('hero-label',    team.division.toUpperCase() + ' UNIT');
  setText('hero-name',     team.name);
  setText('hero-lead-name',team.leadName);
  setText('hero-lead-role',team.leadRole);
  var av = document.getElementById('hero-avatar');
  if (av) { av.textContent = team.leadInitials; av.style.background = team.leadColor; }

  /* Stats */
  setText('stat-members',  team.members);
  setText('stat-growth',   team.growth);
  setText('stat-retention',team.retention + '%');
  setText('stat-perf',     team.perf);
  setTimeout(function() {
    var bar = document.getElementById('stat-retention-bar');
    if (bar) bar.style.width = team.retention + '%';
  }, 200);

  renderRoster();
  renderProjects();
  renderActivity();
});

/* ══ ROSTER ══ */
var rosterExpanded = false;

function renderRoster(query) {
  var rows = query
    ? members.filter(function(m) { return m.name.toLowerCase().includes(query.toLowerCase()) || m.role.toLowerCase().includes(query.toLowerCase()); })
    : members;

  var badge = document.getElementById('member-badge');
  if (badge) badge.textContent = members.length + ' Members';

  var EDIT_SVG   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
  var DELETE_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>';

  var rosterHeader  = document.getElementById('roster-header');
  var rosterThead   = document.getElementById('roster-thead');
  var tbody         = document.getElementById('roster-tbody');
  if (!tbody) return;

  if (rosterExpanded) {
    /* ── EXPANDED: All Members + email + actions + ✕ ── */
    if (rosterHeader) rosterHeader.innerHTML =
      '<div style="display:flex;align-items:center;gap:10px;">' +
        '<h2 class="section-title">All Members</h2>' +
        '<span class="member-count-badge" id="member-badge">' + members.length + ' Members</span>' +
      '</div>' +
      '<button class="tab-close-btn" onclick="collapseRoster()" title="Kembali">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button>';

    if (rosterThead) rosterThead.innerHTML = '<tr><th>MEMBER</th><th>ROLE</th><th>EMAIL</th><th>JOIN DATE</th><th>STATUS</th></tr>';

    tbody.innerHTML = rows.map(function(m, i) {
      return '<tr>' +
        '<td><div class="staff-cell"><div class="staff-avatar" style="background:' + m.color + ';">' + m.initials + '</div><div><div class="staff-name">' + m.name + '</div></div></div></td>' +
        '<td class="staff-role">' + m.role + '</td>' +
        '<td class="att-date" style="color:#6b7c8d;">' + m.email + '</td>' +
        '<td class="att-date">' + m.joinDate + '</td>' +
        '<td><span class="mem-status ' + m.status + '">' + m.status.charAt(0).toUpperCase() + m.status.slice(1) + '</span></td>' +
      '</tr>';
    }).join('');

  } else {
    /* ── PREVIEW: 4 cols, no email, VIEW ALL link ── */
    if (rosterHeader) rosterHeader.innerHTML =
      '<h2 class="section-title">Team Roster</h2>' +
      '<a class="view-all" href="#" onclick="expandRoster();return false;">VIEW ALL</a>';

    if (rosterThead) rosterThead.innerHTML = '<tr><th>MEMBER</th><th>ROLE</th><th>JOIN DATE</th><th>STATUS</th></tr>';

    var preview = rows.slice(0, 4);
    tbody.innerHTML = preview.map(function(m) {
      return '<tr>' +
        '<td><div class="staff-cell"><div class="staff-avatar" style="background:' + m.color + ';">' + m.initials + '</div><div><div class="staff-name">' + m.name + '</div></div></div></td>' +
        '<td class="staff-role">' + m.role + '</td>' +
        '<td class="att-date">' + m.joinDate + '</td>' +
        '<td><span class="mem-status ' + m.status + '">' + m.status.charAt(0).toUpperCase() + m.status.slice(1) + '</span></td>' +
      '</tr>';
    }).join('');
  }
}

function expandRoster() {
  rosterExpanded = true;
  renderRoster();
}

function collapseRoster() {
  rosterExpanded = false;
  renderRoster();
}

function filterMembers(q) { renderRoster(q); }

function editMember(i) {
  alert('Edit member: ' + members[i].name + '\n(Form edit akan muncul di sini)');
}

function deleteMember(i, name) {
  if (confirm('Hapus ' + name + ' dari tim ini?')) {
    members.splice(i, 1);
    renderRoster();
  }
}

/* ══ PROJECTS ══ */
function renderProjects() {
  var projs = PROJECTS[team.id] || [];
  var html = projs.map(function(p, i) {
    return (i > 0 ? '<div class="project-divider"></div>' : '') +
      '<div class="project-item">' +
        '<div class="project-header"><span class="project-name">' + p.name + '</span><span class="project-pct">' + p.pct + '%</span></div>' +
        '<div class="project-bar"><div class="project-fill" data-w="' + p.pct + '" style="width:0%;"></div></div>' +
        '<div class="project-desc">' + p.desc + '</div>' +
      '</div>';
  }).join('');
  var el = document.getElementById('projects-list');
  if (el) {
    el.innerHTML = html;
    setTimeout(function() {
      el.querySelectorAll('.project-fill').forEach(function(f) { f.style.width = f.getAttribute('data-w') + '%'; });
    }, 200);
  }
}

/* ══ ACTIVITY ══ */
function renderActivity() {
  var acts = ACTIVITIES[team.id] || [];
  var html = acts.map(function(a) {
    return '<div class="activity-item">' +
      '<div class="activity-dot">' + ICON_SVG + '</div>' +
      '<div><div class="activity-text">' + a.text + '</div><div class="activity-meta">' + a.meta + '</div></div>' +
    '</div>';
  }).join('');
  var el = document.getElementById('activity-list');
  if (el) el.innerHTML = html;
}

/* ══ EDIT TEAM MODAL ══ */
function openEditModal() {
  var el = document.getElementById('edit-modal');
  if (!el) return;
  setVal('ef-name', team.name);
  setVal('ef-function', team.function);
  setVal('ef-desc', team.desc || '');
  el.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeEditModal() {
  var el = document.getElementById('edit-modal');
  if (el) el.classList.remove('open');
  document.body.style.overflow = '';
}
function submitEdit() {
  var name = (document.getElementById('ef-name') || {}).value || '';
  if (name.trim()) { team.name = name.trim(); setText('hero-name', team.name); }
  closeEditModal();
  alert('Perubahan berhasil disimpan!');
}

/* ══ HELPERS ══ */
function setText(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }
function setVal(id, val)  { var el = document.getElementById(id); if (el) el.value = val; }
