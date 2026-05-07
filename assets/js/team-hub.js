/* ══ ROLE CONFIG ══ */
var CURRENT_ROLE = 'manager'; // 'staff' | 'team-lead' | 'manager' | 'c-level'
var CAN_MANAGE   = (CURRENT_ROLE === 'manager' || CURRENT_ROLE === 'c-level');

/* ══ TEAM DATA ══ */
var TEAMS = [
  { id:1, name:'Engineering Alpha',  division:'Software Development', leadInitials:'AH', leadName:'Andi Hartono',  leadColor:'linear-gradient(135deg,#2980b9,#5dade2)', leadRole:'Lead Technical Architect', members:14, function:'Cloud Infrastructure', iconBg:'#e8f5ec', iconColor:'#3d5c45', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>', retention:98.2, perf:4.8, growth:'+3 this month', desc:'Core engineering team responsible for cloud infrastructure and backend systems.' },
  { id:2, name:'Product Design',     division:'Creative & UX',        leadInitials:'MP', leadName:'Maya Putri',    leadColor:'linear-gradient(135deg,#7d5a9a,#b08bc0)', leadRole:'Senior UX Designer',       members:8,  function:'Interface Systems',    iconBg:'#f0eafb', iconColor:'#7d5a9a', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="2"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>', retention:95.5, perf:4.6, growth:'+1 this month', desc:'Design team focused on user experience and interface systems.' },
  { id:3, name:'Human Resources',    division:'People & Culture',     leadInitials:'LS', leadName:'Lisa Santoso',  leadColor:'linear-gradient(135deg,#16a085,#48c9b0)', leadRole:'HR Manager',               members:5,  function:'Talent Acquisition',   iconBg:'#e6f0fb', iconColor:'#2980b9', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', retention:97.0, perf:4.7, growth:'Stable', desc:'HR team managing talent acquisition, onboarding, and people culture.' },
  { id:4, name:'Data & Analytics',   division:'Data Science',         leadInitials:'SC', leadName:'Sam Chen',      leadColor:'linear-gradient(135deg,#4a6080,#7a9abf)', leadRole:'Data Lead',                members:10, function:'Business Intelligence', iconBg:'#fff4e5', iconColor:'#b06000', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>', retention:93.8, perf:4.4, growth:'+2 this month', desc:'Responsible for data pipelines, analytics, and business intelligence.' },
  { id:5, name:'DevOps & Infra',     division:'Engineering',          leadInitials:'BK', leadName:'Budi Kurnia',   leadColor:'linear-gradient(135deg,#8e44ad,#bb8fce)', leadRole:'DevOps Lead',              members:6,  function:'Infrastructure & CI/CD', iconBg:'#fdecea', iconColor:'#c0392b', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/></svg>', retention:91.0, perf:4.3, growth:'Stable', desc:'Managing DevOps pipelines, CI/CD, and infrastructure automation.' },
  { id:6, name:'Product Management', division:'Product',              leadInitials:'DN', leadName:'Diana Nas',     leadColor:'linear-gradient(135deg,#2980b9,#5dade2)', leadRole:'Product Manager',          members:7,  function:'Product Strategy',      iconBg:'#e8f5ec', iconColor:'#2e7d4f', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>', retention:96.5, perf:4.9, growth:'+1 this month', desc:'Driving product strategy, roadmaps, and cross-functional alignment.' },
];

/* ══ LIST PAGE ══ */
var currentPage   = 1;
var filteredTeams = TEAMS.slice();

function filterTeams() {
  var q     = (document.getElementById('search-input') || {}).value || '';
  var limit = parseInt((document.getElementById('limit-select') || {}).value || 6);
  filteredTeams = TEAMS.filter(function(t) {
    return t.name.toLowerCase().includes(q.toLowerCase()) ||
           t.division.toLowerCase().includes(q.toLowerCase()) ||
           t.leadName.toLowerCase().includes(q.toLowerCase());
  });
  currentPage = 1;
  renderList(limit);
}

function changePage(dir) {
  var limit   = parseInt(document.getElementById('limit-select').value);
  var maxPage = Math.ceil(filteredTeams.length / limit) || 1;
  currentPage = Math.max(1, Math.min(maxPage, currentPage + dir));
  renderList(limit);
}

function renderList(limit) {
  var total   = filteredTeams.length;
  var maxPage = Math.ceil(total / limit) || 1;
  var start   = (currentPage - 1) * limit;
  var end     = Math.min(start + limit, total);
  var visible = filteredTeams.slice(start, end);

  var html = visible.map(function(t) {
    return '<a class="team-row" href="team-detail.html?id=' + t.id + '">' +
      '<div class="team-name-cell"><div class="team-icon" style="background:' + t.iconBg + ';color:' + t.iconColor + ';">' + t.icon + '</div><div><div class="team-name-text">' + t.name + '</div><div class="team-name-sub">' + t.division + '</div></div></div>' +
      '<div class="team-lead-cell"><div class="staff-avatar" style="width:28px;height:28px;font-size:10px;background:' + t.leadColor + ';">' + t.leadInitials + '</div><span class="team-lead-name">' + t.leadName + '</span></div>' +
      '<div><span class="members-badge">' + t.members + ' Players</span></div>' +
      '<div class="team-function">' + t.function + '</div>' +
      '<div class="team-actions"><div style="display:flex;gap:6px;">' +
        '<button class="btn-mem-edit" onclick="event.preventDefault();event.stopPropagation();alert(\'Edit: ' + t.name + '\')">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
          ' Edit</button>' +
        '<button class="btn-mem-delete" onclick="event.preventDefault();event.stopPropagation();deleteTeam(' + t.id + ',\'' + t.name + '\')">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>' +
          ' Hapus</button>' +
      '</div></div>' +
    '</a>';
  }).join('');

  var el = document.getElementById('team-list');
  if (el) el.innerHTML = html || '<div class="team-empty">Tidak ada tim ditemukan</div>';

  var info = document.getElementById('pag-info');
  if (info) info.textContent = 'Showing ' + (start+1) + '-' + end + ' of ' + total + ' teams';
  var prev = document.getElementById('pag-prev');
  var next = document.getElementById('pag-next');
  if (prev) prev.disabled = currentPage <= 1;
  if (next) next.disabled = currentPage >= maxPage;
}

function deleteTeam(id, name) {
  if (confirm('Hapus tim "' + name + '"?')) {
    TEAMS = TEAMS.filter(function(t) { return t.id !== id; });
    filterTeams();
  }
}

function openCreateModal() { document.getElementById('create-modal').classList.add('open'); document.body.style.overflow='hidden'; }
function closeCreateModal() { document.getElementById('create-modal').classList.remove('open'); document.body.style.overflow=''; }
function submitCreateTeam() {
  var name = (document.getElementById('f-name')||{}).value || '';
  var div  = (document.getElementById('f-division')||{}).value || '';
  var lead = (document.getElementById('f-lead')||{}).value || '';
  var func = (document.getElementById('f-function')||{}).value || '';
  var err  = document.getElementById('form-error');
  if (!name.trim() || !div || !lead || !func.trim()) {
    if (err) { err.textContent='Harap lengkapi semua field wajib (*)'; err.style.display='block'; }
    return;
  }
  if (err) err.style.display='none';
  closeCreateModal();
  alert('Tim "' + name + '" berhasil dibuat!');
}

/* ══ SHARED UTILS ══ */
function setActive(el) { document.querySelectorAll('.nav-item').forEach(function(n){n.classList.remove('active');}); el.classList.add('active'); }
function handleLogout() { if(confirm('Yakin ingin logout?')) window.location.href='index.html'; }

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeCreateModal();
    if (typeof closeEditModal === 'function') closeEditModal();
  }
});

/* ══ INIT ══ */
window.addEventListener('load', function() {
  var btn = document.getElementById('btn-create');
  if (btn && CAN_MANAGE) btn.style.display = 'inline-flex';
  if (document.getElementById('team-list')) filterTeams();
});
