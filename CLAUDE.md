# CLAUDE.md

Panduan untuk Claude Code saat bekerja di repository ini.

> **Dokumen Lengkap:**
> - **PRD.md** — product requirements, fitur, role, API reference lengkap
> - **agent.md** — mental model, pattern, CSS class reference, pitfalls
> - **instruction.md** — step-by-step implementation patterns dengan code examples

---

## Project Overview

Sanctuary HRIS adalah aplikasi web attendance management untuk **Gaming House** (game streaming). Static HTML/CSS/Vanilla JS yang berkomunikasi dengan PHP REST API.

**Key Characteristics:**

- No build tools, bundlers, atau frameworks
- Vanilla JavaScript + fetch API
- Node.js static server (port 3000)
- Backend API: PHP Native di port 8000
- 5 roles: `c_level`, `hrd_manager`, `technical_manager`, `team_leader`, `staff`
- JWT di `localStorage.hris_token`, user data di `localStorage.hris_user`

## Running the Application

```bash
node server.js   # atau: npm start
# Buka http://localhost:3000
```

---

## Project Structure (Current)

```text
.
├── index.html
├── server.js                        # Static server + ROUTES map untuk clean URLs
├── .env                             # URL_LOCAL=http://localhost:8000
├── PRD.md                           # Product requirements document
├── agent.md                         # AI agent guide
├── instruction.md                   # Implementation patterns
├── assets/
│   ├── css/
│   │   ├── dashboard.css            # Base: layout, sidebar, nav, att-table
│   │   ├── team-hub.css             # Buttons, cards, toast, modal, emp-table styles
│   │   ├── employee.css             # emp-table reset, role/status badges
│   │   ├── employee-detail.css      # Profile sidebar layout
│   │   ├── employee-create.css      # Create/update form
│   │   ├── leave.css                # Leave request styles, tab bar
│   │   ├── shift.css                # Shift schedule page
│   │   ├── attendance.css           # Attendance pages
│   │   ├── attendance-manager.css   # Manager attendance view
│   │   ├── biometric.css            # Camera/face recognition UI
│   │   └── report.css               # Report filters, export buttons, badges
│   └── js/
│       ├── env.js                   # Load window.APP_ENV dari .env
│       ├── config.js                # getApiUrl(), getBaseUrl()
│       ├── api.js                   # apiRequest(), extractListData(), guardRoute()
│       ├── auth.js                  # handleLogin(), handleReset(), handleLogout()
│       ├── dashboard-shared.js      # Shared utilities
│       ├── sidebar.js               # loadComponents(), toggleNavGroup()
│       ├── fetch/
│       │   ├── team.js
│       │   ├── team-detail.js
│       │   ├── attendance.js
│       │   ├── attendance-manager.js
│       │   ├── employee.js
│       │   ├── employee-detail.js
│       │   ├── leave.js
│       │   ├── shift.js
│       │   ├── office.js
│       │   ├── face-api.js          # Face embeddings + clock-in + export
│       │   └── report.js            # Report fetch + blob export
│       └── render/
│           ├── team.js
│           ├── attendance.js
│           ├── employee.js
│           └── employee-detail.js
└── pages/
    ├── login.html
    ├── set-password.html            # Reset password dari email link
    ├── dashboard.html               # Router → redirect by role
    ├── components/
    │   ├── sidebar.html             # Collapsible Reports group
    │   └── navbar.html
    ├── dashboard/
    │   ├── dashboard-staff.html
    │   ├── dashboard-teamlead.html
    │   ├── dashboard-manager.html
    │   └── dashboard-clevel.html
    ├── attendance/
    │   ├── attendance-staff.html
    │   ├── attendance-teamlead.html
    │   └── attendance-manager.html
    ├── team/
    │   ├── team-hub.html
    │   └── team-detail.html
    ├── employee/
    │   ├── employee-management.html
    │   ├── employee-detail.html
    │   ├── employee-create.html
    │   ├── employee-update.html
    │   ├── employee-face-sample.html  # List face samples per employee
    │   └── employee-face-capture.html # Capture single face sample
    ├── face-sample/
    │   └── face-sample.html          # Onboarding face registration
    ├── leave-request/
    │   └── leave-request.html
    ├── shift-schedule/
    │   └── shift-schedule.html
    └── report/
        ├── attendance.html
        ├── leave.html
        ├── employees.html
        └── shifts.html
```

---

## Core Patterns

### 1. API Call

```javascript
var result = await apiRequest('/endpoint', {
  method: 'POST',
  body: JSON.stringify({ key: value })
});
// result = { success: boolean, data: any, error: string }

var list   = extractListData(result);    // → array dari paginated/direct response
var single = extractSingleData(result);  // → single object
var meta   = extractMeta(result);        // → { current_page, last_page, per_page, total_records }
```

### 2. Fetch / Render / Page Layer

- **`fetch/[feature].js`** → API calls only, return `{ success, data, error }`
- **`render/[feature].js`** → data transform only, return objects (NO HTML, NO DOM)
- **Page `<script>`** → orchestrate fetch + render, handle DOM + events

### 3. Guard + Init

```javascript
guardRoute(['c_level', 'hrd_manager']);  // redirect jika role tidak match

window.addEventListener('load', function() {
  window.loadComponents();  // inject sidebar + navbar
  loadData();
});
```

### 4. Table (WAJIB pakai keduanya)

```html
<table class="att-table emp-table" style="width:100%;min-width:700px;">
```

`employee.css` WAJIB di-import agar `emp-table` reset override `att-table` scroll hack.

### 5. Sidebar Navigation

Sidebar di-inject via `window.loadComponents()`. Report menu adalah collapsible group — toggle via `window.toggleNavGroup()`.

Role visibility di-handle di `sidebar.js`:

- `staff`: hide employee management, shift schedule, employees report
- `team_leader`: hide employee management, shift schedule
- `c_level`: hide leave request menu

### 6. sessionStorage untuk Navigasi

```javascript
// Before redirect
sessionStorage.setItem('selectedEmployeeId', id);
window.location.href = 'employee-detail.html';

// On target page load
var id = sessionStorage.getItem('selectedEmployeeId');
sessionStorage.removeItem('selectedEmployeeId');
if (!id) { window.location.replace('employee-management.html'); return; }
```

### 7. Clean URL Routes (server.js)

```javascript
var ROUTES = {
  '/set-password':      'pages/set-password.html',
  '/report/attendance': 'pages/report/attendance.html',
  '/report/leave':      'pages/report/leave.html',
  '/report/employees':  'pages/report/employees.html',
  '/report/shifts':     'pages/report/shifts.html'
};
```

Tambahkan entry baru untuk halaman yang butuh clean URL.

---

## Onboarding Flow

1. Admin buat user → sistem kirim email dengan link `/set-password?email=...&token=...`
2. User buka link → `set-password.html` → set password → `POST /password/reset`
3. Response include JWT → disimpan ke localStorage
4. Check `GET /profile` → `has_face_registered`
5. Jika `false` → redirect ke `/pages/face-sample/face-sample.html?onboarding=true` (tanpa sidebar/navbar)
6. Register 5 face samples (pose sequence: Front, Left, Right, Up, Front 2nd)
7. Selesai → redirect ke login

---

## Shift System

**Rotasi (staff & team_leader):** 2 Pagi → 2 Siang → 2 Malam → 2 Libur (berulang)

| Shift     | Jam Kerja    | Break        |
| --------- | ------------ | ------------ |
| Pagi      | 06:00–14:00  | 09:30–10:30  |
| Siang     | 14:00–22:00  | 17:30–18:30  |
| Malam     | 22:00–06:00  | 01:30–02:30  |
| HRD       | 10:00–18:00  | Senin–Jumat  |
| Technical | 13:00–21:00  | Senin–Jumat  |

---

## Attendance System

- **2 sesi per shift**, tidak ada clock-out
- **Session 1:** clock-in awal shift
- **Session 2:** clock-in setelah break
- Validasi: face recognition (Euclidean < 0.5) + GPS (≤ 50m dari kantor)
- Gagal validasi → tidak diblokir, dicatat sebagai `invalid` untuk audit
- Manager → clock-in langsung tanpa face/geo

---

## Leave System

- Jatah: 1 hari per bulan (annual), sick butuh surat dokter
- Approval: staff/TL → HRD, HRD/Technical → c_level
- Tab UI: "My Requests" | "All Employees" (untuk manager roles)

---

## Report Module

4 halaman di `/report/`:

- `attendance.html` — filter year+month, completion badges, summary footer
- `leave.html` — filter year, remaining color coding
- `employees.html` — filter role/status/manager
- `shifts.html` — row styling day off (grey) + override (yellow)

Export: fetch dengan auth header → blob download.

---

## Common Pitfalls

1. **att-table tanpa emp-table + employee.css** → kolom overlap (table-layout:fixed tidak ter-reset)
2. **Relative path dari halaman di root** → gunakan absolute `/pages/...` bukan `pages/...`
3. **Export tanpa auth header** → jangan `window.open()`, gunakan `fetch()` + blob
4. **Tidak hapus sessionStorage setelah baca** → state bocor ke navigasi berikutnya
5. **Lupa guardRoute** → halaman bisa diakses semua role
6. **HTML string dari API tanpa escHtml()** → XSS vulnerability

---

## References

- **PRD.md** — feature requirements, role matrix, API endpoint table
- **agent.md** — CSS classes, button types, pitfalls, cara tambah halaman/sidebar link
- **instruction.md** — code patterns dengan full examples
- **docs/hris_architecture_v2.md** — backend architecture reference
- **docs/list_api_shift_schedule.md** — shift schedule API detail
- **docs/leave_request_api_docs.md** — leave API dengan request/response examples
- **docs/face-recognition-flow.md** — face recognition flow detail
- **docs/geolocation-flow.md** — geolocation flow detail
