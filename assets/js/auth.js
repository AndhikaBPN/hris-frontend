/* ── Navigation ── */
function showReset() {
  window.location.href = 'reset-access.html';
}

function showLogin() {
  clearTimer();
  window.location.href = 'login.html';
}

/* ── LOGIN ── */
async function handleLogin() {
  var email    = document.getElementById('email').value.trim();
  var password = document.getElementById('password').value;
  var msg      = document.getElementById('login-msg');
  msg.className = 'msg';
  msg.textContent = '';

  if (!email || !password) {
    msg.textContent = 'Harap isi email dan password.';
    msg.className = 'msg error'; return;
  }
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    msg.textContent = 'Format email tidak valid.';
    msg.className = 'msg error'; return;
  }
  if (password.length < 6) {
    msg.textContent = 'Password minimal 6 karakter.';
    msg.className = 'msg error'; return;
  }

  msg.textContent = 'Sedang memproses...';
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
      msg.textContent = 'Autentikasi berhasil! Selamat datang, ' + (payload.user?.name || '') + '.';
      msg.className = 'msg success';
      window.location.href = 'dashboard.html';
    } else {
      msg.textContent = data.message || 'Email atau password salah.';
      msg.className = 'msg error';
    }
  } catch (err) {
    msg.textContent = err.message || 'Gagal terhubung ke server. Pastikan server berjalan.';
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

/* ── RESET SUBMIT ── */
function handleReset() {
  var boxes   = document.querySelectorAll('.otp-box');
  var otp     = Array.from(boxes).map(function(b) { return b.value; }).join('');
  var newPass = document.getElementById('new-password').value;
  var msg     = document.getElementById('reset-msg');
  msg.className = 'msg';
  msg.textContent = '';

  if (otp.length < 6) {
    msg.textContent = 'Masukkan 6 digit kode OTP.';
    msg.className = 'msg error'; return;
  }
  if (!newPass || newPass.length < 6) {
    msg.textContent = 'Password baru minimal 6 karakter.';
    msg.className = 'msg error'; return;
  }
  msg.textContent = 'Password berhasil diubah! Mengarahkan ke login...';
  msg.className = 'msg success';
  clearTimer();
  setTimeout(function() {
    window.location.href = 'login.html';
  }, 2000);
}

/* ── COUNTDOWN TIMER ── */
var _timer = null;
function startCountdown(seconds) {
  clearTimer();
  document.getElementById('resend-btn').style.display = 'none';
  var el = document.getElementById('resend-timer');
  el.textContent = 'Kirim ulang dalam ' + seconds + 's';
  _timer = setInterval(function() {
    seconds--;
    if (seconds > 0) {
      el.textContent = 'Kirim ulang dalam ' + seconds + 's';
    } else {
      clearTimer();
      el.textContent = '';
      document.getElementById('resend-btn').style.display = 'inline';
    }
  }, 1000);
}

function startResend() {
  document.getElementById('resend-btn').style.display = 'none';
  clearOTP();
  document.getElementById('reset-msg').className = 'msg';
  startCountdown(60);
  document.querySelectorAll('.otp-box')[0].focus();
}

function clearTimer() {
  if (_timer) { clearInterval(_timer); _timer = null; }
}
