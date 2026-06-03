# Agent Guide — Sanctuary HRIS Frontend

Panduan ini untuk AI agent yang mengerjakan codebase ini. Baca sebelum mulai task apapun.

---

## Stack & Constraints

- **No framework.** Murni HTML + CSS + Vanilla JS. Jangan suggest React, Vue, bundler, atau npm packages.
- **No build step.** Edit file langsung, langsung terefleksi di browser.
- **Backend terpisah** di `localhost:8000`. Frontend hanya consume REST API.
- **CDN-only** untuk library eksternal (face-api.js, Lucide icons).

---

## File Layout Mental Model

```
pages/
  [feature]/
    [feature]-page.html       ← halaman utama
  components/
    sidebar.html              ← injected via fetch()
    navbar.html               ← injected via fetch()

assets/
  js/
    api.js                    ← apiRequest(), extractListData(), guardRoute()
    sidebar.js                ← loadComponents(), toggleNavGroup()
    dashboard-shared.js       ← shared utilities
    fetch/[feature].js        ← ONLY API calls, return { success, data, error }
    render/[feature].js       ← ONLY data transform, return objects (NO HTML)
  css/
    dashboard.css             ← global layout, sidebar, nav, table base
    team-hub.css              ← cards, buttons, tables, toast, modal
    employee.css              ← emp-table reset, emp-role-badge, emp-status-badge
    report.css                ← filters, export buttons, report badges
    [feature].css             ← feature-specific styles
```

---

## Layer Pattern (WAJIB)

Setiap fitur terdiri dari 3 layer:

**1. Fetch layer** (`assets/js/fetch/[feature].js`)
```javascript
async function fetchSomething(opts) {
  var result = await apiRequest('/endpoint?' + params);
  if (!result.success) return { success: false, data: [], error: result.error };
  return { success: true, data: extractListData(result) };
}
```
- HANYA API call
- TIDAK ada DOM manipulation
- Return `{ success, data, error }`

**2. Render layer** (`assets/js/render/[feature].js`)
```javascript
function mapSomethingData(items) {
  return items.map(function(item) {
    return { id: item.id, label: item.name, ... };
  });
}
```
- HANYA data transform
- TIDAK ada HTML string
- TIDAK ada DOM manipulation
- Return plain objects/arrays

**3. Page layer** (inline `<script>` di HTML)
- Import fetch + render via `<script src>` tags
- Call fetch → map → render ke DOM
- Handle event listeners, state, UI logic

---

## Core API Utilities (tersedia di semua halaman)

```javascript
// Semua API call
var result = await apiRequest('/endpoint', { method: 'POST', body: JSON.stringify(data) });

// Extract array dari paginated response
var list = extractListData(result);   // result.data.data[] atau result.data[]

// Extract single object
var obj = extractSingleData(result);  // result.data.data atau result.data

// Guard halaman (redirect ke login jika role tidak match)
guardRoute(['c_level', 'hrd_manager']);

// Base URL
var url = getApiUrl('/path');  // → 'http://localhost:8000/api/path'
```

---

## localStorage Keys

| Key | Isi | Dipakai Untuk |
|-----|-----|---------------|
| `hris_token` | JWT string | Authorization header |
| `hris_user` | JSON `{ id, name, role, email, ... }` | Role check, display name |

Baca user: `JSON.parse(localStorage.getItem('hris_user') || '{}')`

---

## sessionStorage Keys (navigasi antar halaman)

| Key | Dipakai di Fitur |
|-----|-----------------|
| `selectedEmployeeId` | Employee detail navigation |
| `currentEmployeeId` | Persist di employee detail |
| `manageFaceSampleUserId` | Face sample management |
| `manageFaceSampleMode` | `'add'` atau `'edit'` |
| `manageFaceSamplePoseIndex` | Index pose (0–4) |
| `manageFaceSampleId` | ID embedding (edit mode) |
| `manageFaceSampleEmployeeName` | Display name di capture page |
| `emp_toast_msg` | Toast message setelah redirect |
| `emp_toast_type` | `'success'` atau `'error'` |

---

## Sidebar System

Sidebar di-inject via `window.loadComponents()` dari `sidebar.js`.

```javascript
// Di setiap page yang butuh sidebar:
window.loadComponents();  // panggil di window.addEventListener('load', ...)
```

**Reports nav group** adalah collapsible — toggle via `toggleNavGroup()` (global function di `sidebar.js`).

**Role-based visibility** di-handle di `sidebar.js` setelah inject:
- `staff`: hide nav-employee, nav-shift, nav-report-employees
- `team_leader`: hide nav-employee, nav-shift
- `c_level`: hide nav-leave

**Active state** di-set berdasarkan `window.location.pathname`.

---

## Toast Pattern (sama di semua halaman)

```html
<div class="toast" id="app-toast">
  <svg class="toast-icon" id="toast-icon" ...></svg>
  <span class="toast-text" id="toast-text"></span>
</div>
```

```javascript
var _toastTimer = null;
function showToast(message, type) {
  var toast = document.getElementById('app-toast');
  var iconEl = document.getElementById('toast-icon');
  var textEl = document.getElementById('toast-text');
  if (!toast) return;
  if (_toastTimer) { clearTimeout(_toastTimer); _toastTimer = null; }
  toast.className = 'toast ' + (type || 'success');
  textEl.textContent = message;
  iconEl.innerHTML = type === 'error'
    ? '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
    : '<polyline points="20 6 9 17 4 12"/>';
  requestAnimationFrame(function() { requestAnimationFrame(function() { toast.classList.add('show'); }); });
  _toastTimer = setTimeout(function() { toast.classList.remove('show'); _toastTimer = null; }, 3500);
}
```

---

## CSS Class Reference

### Buttons
| Class | Tampilan | Dipakai untuk |
|-------|----------|---------------|
| `btn-create-team` | Hijau solid, ikon+label | Primary action (Create, Add) |
| `btn-edit-team` | Hijau outline | Secondary action (Edit, Manage) |
| `btn-mem-edit` | Kecil, tabel row action | Edit/Retake dalam tabel |
| `back-btn` | Text link dengan chevron | Back navigation |
| `btn-export` | Green outline, kecil | Export XLSX/PDF |

### Tables
Kombinasi wajib: `class="att-table emp-table"`
- `att-table` → base table styling dari `dashboard.css`
- `emp-table` → reset display overrides (dari `employee.css`) agar tabel tidak scroll-locked

Untuk tabel dengan banyak kolom, tambahkan `min-width`:
```html
<table class="att-table emp-table" style="width:100%;min-width:900px;">
```

### Cards & Layout
| Class | Deskripsi |
|-------|-----------|
| `card` | White card container |
| `emp-card-header` | Flex header: title kiri, action kanan |
| `emp-card-sub` | Sub-text di bawah title |
| `emp-empty` | Empty/loading state di `<td>` |
| `page-header-row` | Flex header row dengan title halaman |
| `hub-title` | H1 judul halaman |
| `hub-sub` | Sub-label uppercase |

---

## Common Pitfalls

1. **att-table tanpa emp-table** → kolom overlap karena `table-layout: fixed`. Selalu pakai keduanya + import `employee.css`.
2. **Relative path dari `/set-password`** → page di-serve dari root, gunakan absolute path `/pages/...`.
3. **Export file tanpa auth** → gunakan `fetch(url, { headers: { Authorization: Bearer } })` dan buat blob, bukan `window.open()`.
4. **sessionStorage tidak dihapus** → setelah baca navigasi state, hapus key yang sudah tidak perlu.
5. **Sidebar loadComponents** → selalu `await` atau call setelah page init, bukan sebelum.
6. **Forgot guardRoute** → setiap page wajib panggil `guardRoute([...roles])` di awal script.

---

## Menambah Halaman Baru

1. Buat `pages/[feature]/[name].html`
2. CSS imports: minimal `dashboard.css` + `team-hub.css`
3. Script imports: `env.js`, `config.js`, `api.js`, `dashboard-shared.js`, `sidebar.js`
4. Tambah fetch functions di `assets/js/fetch/[feature].js`
5. Panggil `guardRoute([roles])` di awal script
6. Panggil `window.loadComponents()` di `window.addEventListener('load', ...)`
7. Jika butuh route bersih: tambah ke `ROUTES` di `server.js`
8. Update link di `sidebar.js` jika perlu link baru

---

## Menambah Sidebar Link Baru

**Flat link:**
```html
<!-- sidebar.html -->
<a class="nav-item nav-myfeature" href="#">[icon]Label</a>
```
```javascript
// sidebar.js, dalam loadComponents callback
var myLink = document.querySelector('.nav-myfeature');
if (myLink) myLink.href = '../myfeature/page.html';
// hide jika perlu:
if (userRole === 'staff') myLink.style.display = 'none';
```

**Child dalam Reports group:** tambah `<a class="nav-item nav-child nav-report-xxx">` di dalam `nav-reports-children` di `sidebar.html`, lalu set href di `sidebar.js`.
