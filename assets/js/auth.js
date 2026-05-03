var PAGE_TRANSITION_DURATION = 220;

function applyPageEnterAnimation() {
  var page = document.querySelector('.page.active');
  var direction = sessionStorage.getItem('hris_page_transition');
  sessionStorage.removeItem('hris_page_transition');

  if (!page || direction !== 'reverse') return;
  page.classList.add('page-enter-reverse');
}

function navigateWithAnimation(url, direction) {
  var page = document.querySelector('.page.active');
  sessionStorage.setItem('hris_page_transition', direction || 'forward');

  if (!page || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.location.href = url;
    return;
  }

  page.classList.add('page-exit');
  if (direction === 'reverse') {
    page.classList.add('page-exit-reverse');
  }
  setTimeout(function() {
    window.location.href = url;
  }, PAGE_TRANSITION_DURATION);
}

applyPageEnterAnimation();

/* ── Navigation ── */
function showReset() {
  navigateWithAnimation('reset-access.html', 'reverse');
}

function showLogin() {
  clearTimer();
  navigateWithAnimation('login.html', 'forward');
}

/* ── LOGIN ── */
async function handleLogin() {
  var email    = document.getElementById('email').value.trim();
  var password = document.getElementById('password').value;
  var msg      = document.getElementById('login-msg');
  msg.className = 'msg';
  msg.textContent = '';

  if (!email || !password) {
    msg.textContent = 'Please enter email and password.';
    msg.className = 'msg error'; return;
  }
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    msg.textContent = 'Invalid email format.';
    msg.className = 'msg error'; return;
  }
  if (password.length < 6) {
    msg.textContent = 'Password must be at least 6 characters.';
    msg.className = 'msg error'; return;
  }

  msg.textContent = 'Processing...';
  msg.className = 'msg';

  try {
    var data = await apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email: email, password: password })
    });

    if (data.success) {
      var payload = data.data || {};
      if (payload.token) {
        localStorage.setItem('hris_token', payload.token);
      }
      if (payload.user) {
        localStorage.setItem('hris_user', JSON.stringify(payload.user));
      }
      msg.textContent = 'Authentication successful! Welcome, ' + (payload.user?.name || '') + '.';
      msg.className = 'msg success';
      
      var userRole = payload.user?.role;
      console.log(userRole);
      if (userRole === 'c_level') {
        window.location.href = 'dashboard/dashboard-clevel.html';
      } else if (userRole === 'hrd_manager' || userRole === 'technical_manager') {
        window.location.href = 'dashboard/dashboard-manager.html';
      } else if (userRole === 'team_leader') {
        window.location.href = 'dashboard/dashboard-teamlead.html';
      } else {
        window.location.href = 'dashboard/dashboard-staff.html';
      }
    } else {
      msg.textContent = data.message || 'Invalid email or password.';
      msg.className = 'msg error';
    }
  } catch (err) {
    msg.textContent = err.message || 'Failed to connect to server. Make sure the server is running.';
    msg.className = 'msg error';
    console.error('Login error:', err);
  }
}

var passwordInput = document.getElementById('password');
if (passwordInput) {
  passwordInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') handleLogin();
  });
}

/* ── OTP BOXES ── */
function clearOTP() {
  document.querySelectorAll('.otp-box').forEach(function(b) {
    b.value = ''; b.classList.remove('filled');
  });
}

var otpRow = document.getElementById('otp-row');
if (otpRow) {
  otpRow.addEventListener('input', function(e) {
    var boxes = document.querySelectorAll('.otp-box');
    var idx   = Array.from(boxes).indexOf(e.target);
    var val   = e.target.value.replace(/\D/g, '');
    e.target.value = val;
    if (val) {
      e.target.classList.add('filled');
      if (idx < boxes.length - 1) boxes[idx + 1].focus();
    } else {
      e.target.classList.remove('filled');
    }
  });

  otpRow.addEventListener('keydown', function(e) {
    var boxes = document.querySelectorAll('.otp-box');
    var idx   = Array.from(boxes).indexOf(e.target);
    if (e.key === 'Backspace' && !e.target.value && idx > 0) {
      boxes[idx - 1].focus();
      boxes[idx - 1].value = '';
      boxes[idx - 1].classList.remove('filled');
    }
    if (e.key === 'ArrowLeft' && idx > 0) boxes[idx - 1].focus();
    if (e.key === 'ArrowRight' && idx < boxes.length - 1) boxes[idx + 1].focus();
  });

  otpRow.addEventListener('paste', function(e) {
    e.preventDefault();
    var text  = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
    var boxes = document.querySelectorAll('.otp-box');
    text.split('').forEach(function(ch, i) {
      if (boxes[i]) { boxes[i].value = ch; boxes[i].classList.add('filled'); }
    });
    var next = boxes[Math.min(text.length, 5)];
    if (next) next.focus();
  });
}

/* ── RESET ACCESS FLOW ── */
async function sendOTP() {
  var email = document.getElementById('reset-email').value.trim();
  var msg   = document.getElementById('email-msg');
  if (!msg) return;

  if (!email) {
    showMsg('email-msg', 'Please enter your email.', 'error');
    return;
  }

  showMsg('email-msg', 'Sending OTP...', 'success');
  
  try {
    var data = await apiRequest('/otp/send', {
      method: 'POST',
      body: JSON.stringify({ email: email })
    });

    if (data.success) {
      showMsg('otp-msg', 'OTP sent successfully!', 'success');
      goToStep('step-otp');
    } else {
      showMsg('email-msg', data.message || 'Failed to send OTP.', 'error');
    }
  } catch (err) {
    showMsg('email-msg', err.message || 'Connection error.', 'error');
  }
}

async function verifyOTP() {
  var email = document.getElementById('reset-email').value.trim();
  var boxes = document.querySelectorAll('.otp-box');
  var otp   = Array.from(boxes).map(function(b) { return b.value; }).join('');
  var msg   = document.getElementById('otp-msg');

  if (otp.length < 6) {
    showMsg('otp-msg', 'Please enter complete 6-digit OTP.', 'error');
    return;
  }

  showMsg('otp-msg', 'Verifying...', 'success');

  try {
    var data = await apiRequest('/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email: email, otp_code: otp })
    });

    if (data.success) {
      showMsg('password-msg', 'OTP verified!', 'success');
      goToStep('step-password');
    } else {
      showMsg('otp-msg', data.message || 'Invalid OTP.', 'error');
    }
  } catch (err) {
    showMsg('otp-msg', err.message || 'Verification failed.', 'error');
  }
}

async function handleReset() {
  var email     = document.getElementById('reset-email').value.trim();
  var boxes     = document.querySelectorAll('.otp-box');
  var otp       = Array.from(boxes).map(function(b) { return b.value; }).join('');
  var pass      = document.getElementById('new-password').value;
  var confirm   = document.getElementById('confirm-password').value;
  var msg       = document.getElementById('password-msg');

  // Password validation
  var passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^$*])[A-Za-z\d@$!%*?&#^$*]{8,}$/;
  if (!passRegex.test(pass)) {
    showMsg('password-msg', 'Password must be min 8 chars, 1 upper, 1 lower, 1 number, and 1 special char.', 'error');
    return;
  }

  if (pass !== confirm) {
    showMsg('password-msg', 'Passwords do not match.', 'error');
    return;
  }

  showMsg('password-msg', 'Resetting password...', 'success');

  try {
    var data = await apiRequest('/password/reset', {
      method: 'POST',
      body: JSON.stringify({
        email: email,
        otp_code: otp,
        new_password: pass,
        new_password_confirmation: confirm
      })
    });

    if (data.success) {
      showMsg('password-msg', 'Password successfully reset! Redirecting to login...', 'success');
      setTimeout(function() {
        showLogin();
      }, 2000);
    } else {
      showMsg('password-msg', data.message || 'Reset failed.', 'error');
    }
  } catch (err) {
    showMsg('password-msg', err.message || 'Error occurred.', 'error');
  }
}

function showMsg(id, text, type) {
  var el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = 'msg ' + type;
  el.style.display = 'block';
}

function goToStep(stepId) {
  document.querySelectorAll('.reset-step').forEach(function(s) {
    s.classList.remove('active');
  });
  var step = document.getElementById(stepId);
  if (step) step.classList.add('active');

  if (stepId === 'step-otp') {
    startCountdown(60);
    var firstBox = document.querySelectorAll('.otp-box')[0];
    if (firstBox) firstBox.focus();
  }
}

/* ── COUNTDOWN TIMER ── */
var _timer = null;
function startCountdown(seconds) {
  clearTimer();
  var resendButton = document.getElementById('resend-btn');
  var el = document.getElementById('resend-timer');
  if (!resendButton || !el) return;

  resendButton.style.display = 'none';
  el.textContent = 'Resend in ' + seconds + 's';
  _timer = setInterval(function() {
    seconds--;
    if (seconds > 0) {
      el.textContent = 'Resend in ' + seconds + 's';
    } else {
      clearTimer();
      el.textContent = '';
      resendButton.style.display = 'inline';
    }
  }, 1000);
}

function startResend() {
  var resendButton = document.getElementById('resend-btn');
  if (resendButton) {
    resendButton.style.display = 'none';
  }
  clearOTP();
  var resetMsg = document.getElementById('reset-msg');
  if (resetMsg) {
    resetMsg.className = 'msg';
  }
  startCountdown(60);
  var firstOtpBox = document.querySelectorAll('.otp-box')[0];
  if (firstOtpBox) {
    firstOtpBox.focus();
  }
}

function togglePassword(btn, inputId) {
  var input = document.getElementById(inputId);
  if (!input) return;
  
  var isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  
  // Update icon
  var icon = btn.querySelector('i') || btn.querySelector('svg');
  if (icon) {
    var newIcon = isPass ? 'eye-off' : 'eye';
    icon.setAttribute('data-lucide', newIcon);
    lucide.createIcons();
  }
}

function clearTimer() {
  if (_timer) { clearInterval(_timer); _timer = null; }
}
