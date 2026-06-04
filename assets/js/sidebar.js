/* ══════════════════════════════════════════════
    LOAD COMPONENTS — sidebar & navbar injection
    ══════════════════════════════════════════════ */

/* ── Profile Modal Logic ── */
var _profileData = null;
var _profilePhotoFile = null;

function _injectProfileModal() {
  if (document.getElementById('profile-modal-overlay')) return;
  var html = '<div class="profile-modal-overlay" id="profile-modal-overlay">' +
    '<div class="profile-modal">' +
      '<div class="profile-modal-header">' +
        '<span class="profile-modal-title">My Profile</span>' +
        '<button class="profile-modal-close" onclick="closeProfileModal()">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="profile-photo-section">' +
        '<div class="profile-photo-wrap" onclick="document.getElementById(\'profile-photo-input\').click()" title="Click to change photo">' +
          '<div class="profile-photo-display" id="profile-photo-display">U</div>' +
          '<div class="profile-photo-overlay">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>' +
            'Change Photo' +
          '</div>' +
        '</div>' +
        '<input type="file" id="profile-photo-input" accept="image/*" style="display:none;" onchange="previewProfilePhoto(this)">' +
        '<div class="profile-photo-label">Click photo to change</div>' +
      '</div>' +
      '<div class="profile-form-grid">' +
        '<div class="profile-field">' +
          '<label>Full Name</label>' +
          '<input type="text" id="pf-name" disabled>' +
        '</div>' +
        '<div class="profile-field">' +
          '<label>Email</label>' +
          '<input type="text" id="pf-email" disabled>' +
        '</div>' +
        '<div class="profile-field">' +
          '<label>Phone</label>' +
          '<input type="text" id="pf-phone" placeholder="e.g. +628123456789">' +
        '</div>' +
        '<div class="profile-field">' +
          '<label>Gender</label>' +
          '<input type="text" id="pf-gender" disabled>' +
        '</div>' +
        '<div class="profile-field profile-form-full">' +
          '<label>Address</label>' +
          '<textarea id="pf-address" placeholder="Your address..."></textarea>' +
        '</div>' +
        '<div class="profile-field">' +
          '<label>Birth Date</label>' +
          '<input type="text" id="pf-birth-date" disabled>' +
        '</div>' +
        '<div class="profile-field">' +
          '<label>Religion</label>' +
          '<input type="text" id="pf-religion" disabled>' +
        '</div>' +
        '<div class="profile-field">' +
          '<label>Role</label>' +
          '<input type="text" id="pf-role" disabled>' +
        '</div>' +
        '<div class="profile-field">' +
          '<label>Team</label>' +
          '<input type="text" id="pf-team" disabled>' +
        '</div>' +
        '<div class="profile-field">' +
          '<label>Face Registration</label>' +
          '<div id="pf-face-badge" style="margin-top:5px;"></div>' +
        '</div>' +
      '</div>' +
      '<div class="profile-modal-footer">' +
        '<button class="profile-btn-cancel" onclick="closeProfileModal()">Cancel</button>' +
        '<button class="profile-btn-save" id="profile-btn-save" onclick="saveProfile()">Save Changes</button>' +
      '</div>' +
    '</div>' +
  '</div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function _populateProfileForm(d) {
  var ROLE_NAMES = {
    c_level: 'C-Level', hrd_manager: 'HRD Manager',
    technical_manager: 'Technical Manager', team_leader: 'Team Leader', staff: 'Staff'
  };
  var setVal = function(id, val) {
    var el = document.getElementById(id);
    if (el) el.value = val || '';
  };
  setVal('pf-name', d.name);
  setVal('pf-email', d.email);
  setVal('pf-phone', d.phone);
  setVal('pf-gender', d.gender ? (d.gender.charAt(0).toUpperCase() + d.gender.slice(1)) : '');
  setVal('pf-birth-date', d.birth_date || '');
  setVal('pf-religion', d.religion || '');
  setVal('pf-role', ROLE_NAMES[d.role] || (d.role || ''));
  var teamVal = d.role === 'team_leader' ? (d.led_team_name || '—') : (d.team_name || '—');
  if (d.role !== 'team_leader' && d.role !== 'staff') teamVal = '—';
  setVal('pf-team', teamVal);
  var addr = document.getElementById('pf-address');
  if (addr) addr.value = d.address || '';
  var faceBadge = document.getElementById('pf-face-badge');
  if (faceBadge) {
    faceBadge.innerHTML = d.has_face_registered
      ? '<span class="face-badge-yes">Registered</span>'
      : '<span class="face-badge-no">Not Registered</span>';
  }
  _setProfilePhoto(d.photo_profile, d.name);
}

function _setProfilePhoto(photoUrl, name) {
  var display = document.getElementById('profile-photo-display');
  if (!display) return;
  if (photoUrl) {
    display.innerHTML = '<img src="' + photoUrl + '" style="width:90px;height:90px;border-radius:50%;object-fit:cover;">';
  } else {
    var initials = name ? name.split(' ').map(function(n){ return n[0]; }).join('').toUpperCase().slice(0,2) : 'U';
    display.style.cssText = '';
    display.innerHTML = initials;
  }
}

function _updateTopbarAvatar(photoUrl, name) {
  var av = document.getElementById('avatar-init');
  if (!av) return;
  if (photoUrl) {
    av.innerHTML = '<img src="' + photoUrl + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;">';
  } else {
    var initials = name ? name.split(' ').map(function(n){ return n[0]; }).join('').toUpperCase().slice(0,2) : 'U';
    av.textContent = initials;
  }
}

window.previewProfilePhoto = function(input) {
  if (!input.files || !input.files[0]) return;
  _profilePhotoFile = input.files[0];
  var reader = new FileReader();
  reader.onload = function(e) {
    var display = document.getElementById('profile-photo-display');
    if (display) display.innerHTML = '<img src="' + e.target.result + '" style="width:90px;height:90px;border-radius:50%;object-fit:cover;">';
  };
  reader.readAsDataURL(_profilePhotoFile);
};

window.openProfileModal = async function() {
  _injectProfileModal();
  _profilePhotoFile = null;
  var input = document.getElementById('profile-photo-input');
  if (input) input.value = '';
  var overlay = document.getElementById('profile-modal-overlay');
  if (overlay) overlay.classList.add('open');
  var saveBtn = document.getElementById('profile-btn-save');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Loading...'; }
  try {
    var token = localStorage.getItem('hris_token');
    var res = await fetch(getApiUrl('/profile'), { headers: { 'Authorization': 'Bearer ' + token } });
    var json = await res.json();
    if (json.success) {
      _profileData = json.data || {};
      _populateProfileForm(_profileData);
    }
  } catch(e) {}
  if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save Changes'; }
};

window.closeProfileModal = function() {
  var overlay = document.getElementById('profile-modal-overlay');
  if (overlay) overlay.classList.remove('open');
  _profilePhotoFile = null;
};

window.saveProfile = async function() {
  if (!_profileData) return;
  var btn = document.getElementById('profile-btn-save');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }
  var d = _profileData;
  var fd = new FormData();
  fd.append('name', d.name || '');
  fd.append('email', d.email || '');
  fd.append('birth_date', d.birth_date || '');
  fd.append('gender', d.gender || '');
  fd.append('religion', d.religion || '');
  fd.append('role_id', d.role_id || '');
  if (d.team_id) fd.append('team_id', d.team_id);
  if (d.manager_id) fd.append('manager_id', d.manager_id);
  var phoneEl = document.getElementById('pf-phone');
  var addrEl  = document.getElementById('pf-address');
  fd.append('phone',   phoneEl ? phoneEl.value.trim() : (d.phone || ''));
  fd.append('address', addrEl  ? addrEl.value.trim()  : (d.address || ''));
  if (_profilePhotoFile) fd.append('photo_profile', _profilePhotoFile);
  try {
    var token = localStorage.getItem('hris_token');
    var res = await fetch(getApiUrl('/users/' + d.id), {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + token },
      body: fd
    });
    var json = await res.json();
    if (json.success) {
      var updated = json.data || {};
      var newPhone  = fd.get('phone');
      var newAddr   = fd.get('address');
      var newPhoto  = updated.photo_profile || d.photo_profile || null;
      _profileData.phone   = newPhone;
      _profileData.address = newAddr;
      if (updated.photo_profile) _profileData.photo_profile = updated.photo_profile;
      var userStr = localStorage.getItem('hris_user');
      if (userStr) {
        try {
          var u = JSON.parse(userStr);
          u.phone = newPhone; u.address = newAddr;
          if (updated.photo_profile) u.photo_profile = updated.photo_profile;
          localStorage.setItem('hris_user', JSON.stringify(u));
        } catch(e) {}
      }
      _updateTopbarAvatar(newPhoto, d.name);
      window.closeProfileModal();
      if (typeof window.showToast === 'function') window.showToast('Profile updated successfully', 'success');
    } else {
      if (typeof window.showToast === 'function') window.showToast(json.message || 'Failed to update profile', 'error');
    }
  } catch(e) {
    if (typeof window.showToast === 'function') window.showToast('Network error. Please try again.', 'error');
  }
  if (btn) { btn.disabled = false; btn.textContent = 'Save Changes'; }
};

window.toggleNavGroup = function() {
  var header   = document.getElementById('nav-reports-header');
  var children = document.getElementById('nav-reports-children');
  if (header)   header.classList.toggle('open');
  if (children) children.classList.toggle('open');
};

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

    // Report child links
    const rptAtt = document.querySelector('.nav-report-attendance');
    const rptLeave = document.querySelector('.nav-report-leave');
    const rptEmp = document.querySelector('.nav-report-employees');
    const rptShift = document.querySelector('.nav-report-shifts');
    if (rptAtt)   rptAtt.href   = '../report/attendance.html';
    if (rptLeave) rptLeave.href = '../report/leave.html';
    if (rptEmp)   rptEmp.href   = '../report/employees.html';
    if (rptShift) rptShift.href = '../report/shifts.html';

    // Hide unauthorized menus
    if (userRole === 'staff') {
      document.querySelectorAll('.nav-admin, .nav-employee, .nav-shift').forEach(e => e.style.display = 'none');
      if (rptEmp) rptEmp.style.display = 'none';
    } else if (userRole === 'team_leader') {
      document.querySelectorAll('.nav-admin, .nav-employee, .nav-shift').forEach(e => e.style.display = 'none');
    } else if (userRole === 'c_level') {
      document.querySelectorAll('.nav-leave').forEach(e => e.style.display = 'none');
    } else if (userRole === 'technical_manager') {
      document.querySelectorAll('.nav-admin').forEach(e => e.style.display = 'none');
    } else if (userRole === 'hrd_manager') {
      document.querySelectorAll('.nav-admin').forEach(e => e.style.display = 'none');
    }

    // Auto-expand report group if on a report page
    const currentPath = window.location.pathname;
    const isReportPage = currentPath.includes('/report/');
    if (isReportPage) {
      const rHeader = document.getElementById('nav-reports-header');
      const rChildren = document.getElementById('nav-reports-children');
      if (rHeader) rHeader.classList.add('open');
      if (rChildren) rChildren.classList.add('open');
    }

    // Set Active State based on current URL
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
    let storedPhoto = null;
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.name) initials = u.name.split(' ').map(function(n){ return n[0]; }).join('').toUpperCase().slice(0,2);
        if (u.photo_profile) storedPhoto = u.photo_profile;
      } catch(e) {}
    }
    const av = document.getElementById('avatar-init');
    if (av) {
      if (storedPhoto) {
        av.innerHTML = '<img src="' + storedPhoto + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;">';
      } else {
        av.textContent = initials;
      }
    }

    // Avatar dropdown toggle
    var profileWrap = document.getElementById('profile-wrap');
    var profileDropdown = document.getElementById('profile-dropdown');
    if (profileWrap && profileDropdown) {
      profileWrap.addEventListener('click', function(e) {
        e.stopPropagation();
        profileDropdown.classList.toggle('open');
      });
      document.addEventListener('click', function() {
        profileDropdown.classList.remove('open');
      });
    }
    var btnOpenProfile = document.getElementById('btn-open-profile');
    if (btnOpenProfile) {
      btnOpenProfile.addEventListener('click', function(e) {
        e.stopPropagation();
        if (profileDropdown) profileDropdown.classList.remove('open');
        window.openProfileModal();
      });
    }
  });
  return Promise.all([p1, p2]);
};
