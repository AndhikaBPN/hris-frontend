/* ══════════════════════════════════════════════
    LOAD COMPONENTS — sidebar & navbar injection
    ══════════════════════════════════════════════ */
window.loadComponents = function() {
  const userStr = localStorage.getItem('hris_user');
  let userRole = '';
  if (userStr) {
    try {
      const userObj = JSON.parse(userStr);
      userRole = userObj.role || '';
    } catch(e) {}
  }

  // Create logout modal immediately
  if (!document.getElementById('logout-modal')) {
    const modalHTML = `
      <div id="logout-modal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </div>
          <h3>Log Out</h3>
          <p>Are you sure you want to log out? <br>Your active session will be ended.</p>
          <div class="modal-actions">
            <button class="btn-cancel" onclick="closeLogoutModal()">Cancel</button>
            <button class="btn-logout" onclick="executeLogout()">Log Out</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  const p1 = fetch('../components/sidebar.html').then(r => r.text()).then(html => {
    const el = document.getElementById('sidebar-placeholder');
    if(el) el.outerHTML = html;

    // Set Dynamic Links based on Role
    const navItems = document.querySelectorAll('.nav-item');
    const dashboardLink = navItems[0];
    const attendanceLink = navItems[1];
    const teamLink = navItems[2];

    if (dashboardLink) {
      if (userRole === 'c_level') dashboardLink.href = '../dashboard/dashboard-clevel.html';
      else if (userRole === 'team_leader') dashboardLink.href = '../dashboard/dashboard-teamlead.html';
      else if (userRole === 'hrd_manager' || userRole === 'technical_manager') dashboardLink.href = '../dashboard/dashboard-manager.html';
      else dashboardLink.href = '../dashboard/dashboard-staff.html';
    }

    if (attendanceLink) {
      if (userRole === 'team_leader') attendanceLink.href = '../attendance/attendance-teamlead.html';
      else if (userRole === 'hrd_manager' || userRole === 'technical_manager') attendanceLink.href = '../attendance/attendance-manager.html';
      else attendanceLink.href = '../attendance/attendance-staff.html';
    }

    if (teamLink) {
      if (userRole === 'team_leader' || userRole === 'hrd_manager' || userRole === 'technical_manager' || userRole === 'c_level') teamLink.href = '../team/team-hub.html';
    }

    // Hide unauthorized menus
    if (userRole === 'staff') {
      document.querySelectorAll('.nav-reports, .nav-admin, .nav-team').forEach(e => e.style.display = 'none');
    } else if (userRole === 'team_leader') {
      document.querySelectorAll('.nav-reports, .nav-admin').forEach(e => e.style.display = 'none');
    } else if (userRole === 'hrd_manager' || userRole === 'technical_manager') {
      document.querySelectorAll('.nav-admin').forEach(e => e.style.display = 'none');
    }

    // Set Active State based on current URL
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-item').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') && currentPath.includes(link.getAttribute('href').replace('../', ''))) {
        link.classList.add('active');
      }
    });
  });

  const p2 = fetch('../components/navbar.html').then(r => r.text()).then(html => {
    const el = document.getElementById('navbar-placeholder');
    if(el) el.outerHTML = html;
  });
  return Promise.all([p1, p2]);
};
