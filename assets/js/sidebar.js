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
    const employeeLink = navItems[4]

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
      if (userRole === 'team_leader' || userRole === 'hrd_manager' || userRole === 'technical_manager' || userRole === 'c_level' || userRole === 'staff') teamLink.href = '../team/team-hub.html';
    }

    if (employeeLink) {
      if (userRole === 'c_level' || userRole === 'hrd_manager' || userRole === 'technical_manager') employeeLink.href = '../employee/employee-management.html';
    }

    const faceSampleLink = document.querySelector('.nav-face-sample');
    if (faceSampleLink) faceSampleLink.href = '../face-sample/face-sample.html';

    const empLink = document.querySelector('.nav-employee');
    if (empLink) empLink.href = '../employee/employee-management.html';

    const shiftLink = document.querySelector('.nav-shift');
    if (shiftLink) shiftLink.href = '../shift-schedule/shift-schedule.html';

    const leaveLink = document.querySelector('.nav-leave');
    if (leaveLink) leaveLink.href = '../leave-request/leave-request.html';

    // Hide unauthorized menus
    if (userRole === 'staff') {
      document.querySelectorAll('.nav-reports, .nav-admin, .nav-employee, .nav-shift').forEach(e => e.style.display = 'none');
    } else if (userRole === 'team_leader') {
      document.querySelectorAll('.nav-reports, .nav-admin, .nav-employee, .nav-shift').forEach(e => e.style.display = 'none');
    } else if (userRole === 'c_level') {
      document.querySelectorAll('.nav-leave').forEach(e => e.style.display = 'none');
    } else if (userRole === 'technical_manager') {
      document.querySelectorAll('.nav-admin').forEach(e => e.style.display = 'none');
    } else if (userRole === 'hrd_manager') {
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

  const ROLE_LABELS = {
    c_level: { label: 'C-LEVEL', color: '#8b4513' },
    hrd_manager: { label: 'HRD', color: '#2980b9' },
    technical_manager: { label: 'TECHNICAL', color: '#8e44ad' },
    team_leader: { label: 'TEAM LEAD', color: '#27ae60' },
    staff: { label: 'STAFF', color: '#3d5c45' }
  };

  const p2 = fetch('../components/navbar.html').then(r => r.text()).then(html => {
    const el = document.getElementById('navbar-placeholder');
    if(el) el.outerHTML = html;

    const roleInfo = ROLE_LABELS[userRole] || { label: userRole.toUpperCase(), color: '#3d5c45' };
    const badge = document.getElementById('role-badge');
    if (badge) { badge.textContent = roleInfo.label; badge.style.background = roleInfo.color; }

    let initials = 'U';
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.name) initials = u.name.split(' ').map(function(n){ return n[0]; }).join('').toUpperCase().slice(0,2);
      } catch(e) {}
    }
    const av = document.getElementById('avatar-init');
    if (av) av.textContent = initials;
  });
  return Promise.all([p1, p2]);
};
