# Implementation Instructions — Sanctuary HRIS Frontend

Panduan teknis step-by-step untuk implementasi fitur baru, konvensi kode, dan pola yang dipakai di seluruh codebase.

---

## 1. Struktur Halaman Baru

Setiap halaman mengikuti template ini:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sanctuary – [Nama Halaman]</title>
  <!-- CSS — urutan penting -->
  <link rel="stylesheet" href="../../assets/css/dashboard.css">
  <link rel="stylesheet" href="../../assets/css/team-hub.css">
  <link rel="stylesheet" href="../../assets/css/employee.css">   <!-- jika pakai tabel -->
  <link rel="stylesheet" href="../../assets/css/[feature].css">  <!-- jika ada CSS khusus -->
</head>
<body>
<div id="sidebar-placeholder"></div>

<div class="main-wrap">
<div id="navbar-placeholder"></div>
  <main class="content">

    <div class="page-header-row" style="margin-bottom:1.4rem;">
      <div>
        <h1 class="hub-title">Judul Halaman</h1>
        <div class="hub-sub">SUBTITLE UPPERCASE</div>
      </div>
    </div>

    <!-- Content area -->
    <div class="card" style="padding:1.4rem 1.6rem;">
      <!-- ... -->
    </div>

  </main>
</div>

<!-- Toast -->
<div class="toast" id="app-toast">
  <svg class="toast-icon" id="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></svg>
  <span class="toast-text" id="toast-text"></span>
</div>

<!-- Scripts — urutan penting -->
<script src="../../assets/js/env.js"></script>
<script src="../../assets/js/config.js"></script>
<script src="../../assets/js/api.js"></script>
<script src="../../assets/js/dashboard-shared.js"></script>
<script src="../../assets/js/sidebar.js"></script>
<script src="../../assets/js/fetch/[feature].js"></script>
<script src="../../assets/js/render/[feature].js"></script><!-- jika ada -->
<script>
// 1. Guard route
guardRoute(['c_level', 'hrd_manager']);

// 2. State variables
var _user = JSON.parse(localStorage.getItem('hris_user') || '{}');
var _role = _user.role || '';
var _data = [];

// 3. Functions
async function loadData() { ... }
function renderTable(rows) { ... }

// 4. Init
window.addEventListener('load', function() {
  window.loadComponents();
  loadData();
});
</script>
</body>
</html>
```

**Path CSS/JS** tergantung kedalaman direktori:
- `pages/[feature]/page.html` → `../../assets/...`
- `pages/page.html` → `../assets/...`

---

## 2. Fetch Layer Pattern

File: `assets/js/fetch/[feature].js`

```javascript
/* ══════════════════════════════════════════════
   [FEATURE] FETCH FUNCTIONS
══════════════════════════════════════════════ */

// List dengan pagination + filter
async function fetchItems(opts) {
  var params = [];
  if (opts.page)   params.push('page='   + opts.page);
  if (opts.search) params.push('search=' + encodeURIComponent(opts.search));
  var qs = params.length ? '?' + params.join('&') : '';

  var result = await apiRequest('/items' + qs);
  if (!result.success) return { success: false, data: [], meta: {}, error: result.error };
  return {
    success: true,
    data: extractListData(result),
    meta: extractMeta(result)
  };
}

// Single record
async function fetchItemById(id) {
  var result = await apiRequest('/items/' + id);
  if (!result.success) return { success: false, data: null, error: result.error };
  return { success: true, data: extractSingleData(result) };
}

// Create
async function createItem(payload) {
  var result = await apiRequest('/items', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return { success: result.success, error: result.error };
}

// Update
async function updateItem(id, payload) {
  var result = await apiRequest('/items/' + id, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  return { success: result.success, error: result.error };
}

// Delete
async function deleteItem(id) {
  var result = await apiRequest('/items/' + id, { method: 'DELETE' });
  return { success: result.success, error: result.error };
}
```

**Rules:**
- Selalu return `{ success, data, error }` — tidak pernah throw
- `extractListData(result)` untuk array paginated
- `extractSingleData(result)` untuk single object
- `extractMeta(result)` untuk pagination meta
- Tidak ada DOM manipulation di sini

---

## 3. Render Layer Pattern

File: `assets/js/render/[feature].js`

```javascript
/* ══════════════════════════════════════════════
   [FEATURE] RENDER FUNCTIONS
══════════════════════════════════════════════ */

// Map raw API data ke display-ready objects
function mapItemData(items) {
  return items.map(function(item) {
    return {
      id:         item.id,
      name:       item.name || '—',
      statusLabel: item.is_active ? 'Active' : 'Inactive',
      statusClass: item.is_active ? 'emp-status-active' : 'emp-status-inactive',
      createdAt:  formatDate(item.created_at)
    };
  });
}

// Helper — tidak generate HTML
function formatDate(str) {
  if (!str) return '—';
  var d = new Date(str.replace(' ', 'T'));
  return isNaN(d) ? str : d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
}
```

**Rules:**
- Return plain objects/arrays — BUKAN HTML string
- Tidak ada `document.`, `innerHTML`, atau DOM access
- Setiap helper function murni (input → output, no side effects)

---

## 4. API Call Patterns

### Standard GET List
```javascript
var res = await fetchItems({ page: 1, search: 'keyword' });
if (!res.success) { showError(res.error); return; }
renderTable(res.data);
```

### Standard POST/PUT
```javascript
var res = await createItem({ name: 'John', role: 'staff' });
if (!res.success) {
  showToast(res.error || 'Failed', 'error');
  return;
}
showToast('Saved!', 'success');
loadData(); // refresh
```

### Form Submit
```javascript
form.addEventListener('submit', async function(e) {
  e.preventDefault();
  var btn = document.getElementById('btn-submit');
  btn.disabled = true;

  var payload = {
    name:  document.getElementById('f-name').value.trim(),
    email: document.getElementById('f-email').value.trim()
  };

  var res = await createItem(payload);
  btn.disabled = false;

  if (!res.success) { showToast(res.error || 'Failed', 'error'); return; }
  showToast('Created!', 'success');
  setTimeout(function() { window.location.href = 'list.html'; }, 1500);
});
```

### File Upload (multipart)
```javascript
var formData = new FormData();
formData.append('file', fileInput.files[0]);
// JANGAN set Content-Type — biar browser set boundary otomatis

var result = await apiRequest('/endpoint/import', {
  method: 'POST',
  body: formData,
  headers: {} // override default Content-Type dengan empty agar tidak conflict
});
```

### Export File (blob download dengan auth)
```javascript
async function doExport(format) {
  var url = getApiUrl('/reports/attendance/export') + '?format=' + format + '&year=2026';
  var token = localStorage.getItem('hris_token');
  var response = await fetch(url, { headers: { 'Authorization': 'Bearer ' + token } });
  if (!response.ok) { showToast('Export failed', 'error'); return; }
  var blob = await response.blob();
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function() { URL.revokeObjectURL(a.href); }, 2000);
}
```

---

## 5. Table Pattern

### Standard Table HTML
```html
<div style="overflow-x:auto;">
  <table class="att-table emp-table" style="width:100%;min-width:700px;">
    <thead>
      <tr>
        <th style="width:44px;text-align:center;">#</th>
        <th>Name</th>
        <th style="text-align:center;">Status</th>
        <th style="width:90px;text-align:center;">Action</th>
      </tr>
    </thead>
    <tbody id="main-tbody">
      <tr><td colspan="4" class="emp-empty">Loading...</td></tr>
    </tbody>
  </table>
</div>
```

### Render Table
```javascript
function renderTable(rows) {
  var tbody = document.getElementById('main-tbody');
  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="emp-empty">No data found.</td></tr>';
    return;
  }
  tbody.innerHTML = rows.map(function(r, i) {
    return '<tr>' +
      '<td style="text-align:center;color:#9aabb7;font-size:12px;">' + (i + 1) + '</td>' +
      '<td style="font-weight:500;">' + escHtml(r.name) + '</td>' +
      '<td style="text-align:center;"><span class="' + r.statusClass + '">' + r.statusLabel + '</span></td>' +
      '<td style="text-align:center;">' +
        '<button class="btn-mem-edit" onclick="openEdit(' + r.id + ')">Edit</button>' +
      '</td>' +
    '</tr>';
  }).join('');
}

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
```

**Penting:** Selalu `escHtml()` untuk string dari API sebelum masuk innerHTML.

---

## 6. Card Header dengan Action Button

```html
<div class="emp-card-header">
  <div>
    <div style="font-size:14px;font-weight:600;color:#2c3e50;">Section Title</div>
    <div class="emp-card-sub" id="card-sub">Loading...</div>
  </div>
  <button class="btn-create-team" onclick="openCreateModal()">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
         stroke-linecap="round" stroke-linejoin="round"
         style="width:14px;height:14px;flex-shrink:0;">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
    Add Item
  </button>
</div>
```

---

## 7. Filter Bar Pattern

```html
<div class="rpt-filters"> <!-- atau leave-filters -->
  <select class="rpt-filter-select" id="filter-role" onchange="loadData()">
    <option value="">All Roles</option>
    <option value="staff">Staff</option>
  </select>
  <input class="rpt-filter-input" id="filter-search"
         placeholder="Search by name..."
         oninput="renderFiltered()">
</div>
```

Filter yang auto-fetch (year, month, dropdown): gunakan `onchange="loadData()"`
Filter search text (client-side): gunakan `oninput="renderFiltered()"` — filter dari `_data` yang sudah di-fetch.

---

## 8. Loading & Error States

```javascript
function setLoading(on, colSpan) {
  if (on) {
    document.getElementById('main-tbody').innerHTML =
      '<tr><td colspan="' + colSpan + '" class="emp-empty">' +
      '<span class="rpt-spinner"></span>Loading...</td></tr>';
  }
}

function showError(msg, colSpan) {
  document.getElementById('main-tbody').innerHTML =
    '<tr><td colspan="' + colSpan + '" class="emp-empty" style="color:#c0392b;">' +
    escHtml(msg) +
    ' <button onclick="loadData()" style="margin-left:8px;padding:4px 10px;border:1px solid #c0392b;' +
    'border-radius:6px;color:#c0392b;background:none;cursor:pointer;font-size:12px;">Retry</button>' +
    '</td></tr>';
}
```

---

## 9. Navigation antar Halaman (sessionStorage)

### Set sebelum redirect
```javascript
function goToDetail(id) {
  sessionStorage.setItem('selectedEmployeeId', id);
  window.location.href = 'employee-detail.html';
}
```

### Baca di halaman tujuan
```javascript
window.addEventListener('load', function() {
  var employeeId = sessionStorage.getItem('selectedEmployeeId');
  sessionStorage.removeItem('selectedEmployeeId'); // hapus setelah baca

  if (!employeeId) {
    window.location.replace('employee-management.html');
    return;
  }
  // Persist untuk back navigation
  sessionStorage.setItem('currentEmployeeId', employeeId);
  loadDetail(employeeId);
});
```

### Toast setelah redirect
```javascript
// Di halaman asal (sebelum redirect)
sessionStorage.setItem('emp_toast_msg', 'Saved successfully!');
sessionStorage.setItem('emp_toast_type', 'success');
window.location.href = 'parent-page.html';

// Di halaman tujuan (dalam window load)
var msg  = sessionStorage.getItem('emp_toast_msg');
var type = sessionStorage.getItem('emp_toast_type');
if (msg) {
  sessionStorage.removeItem('emp_toast_msg');
  sessionStorage.removeItem('emp_toast_type');
  setTimeout(function() { showToast(msg, type || 'success'); }, 400);
}
```

---

## 10. Role-Based UI

```javascript
var _user = JSON.parse(localStorage.getItem('hris_user') || '{}');
var _role = _user.role || '';

// Guard halaman
guardRoute(['c_level', 'hrd_manager', 'technical_manager']);

// Conditional UI
var canManage = _role === 'hrd_manager' || _role === 'technical_manager' || _role === 'c_level';
if (canManage) {
  document.getElementById('btn-manage').style.display = 'block';
}

// Sembunyikan elemen berdasarkan role
if (_role === 'staff') {
  document.getElementById('filter-name').style.display = 'none';
}
```

---

## 11. Server Routes

Untuk halaman yang butuh clean URL (bukan path file langsung), tambahkan di `server.js`:

```javascript
var ROUTES = {
  '/set-password':      'pages/set-password.html',
  '/report/attendance': 'pages/report/attendance.html',
  // tambah di sini:
  '/new-feature':       'pages/new-feature/index.html'
};
```

---

## 12. Face Recognition (face-api.js)

```javascript
// Load models (panggil sekali)
await Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'),
  faceapi.nets.faceLandmark68Net.loadFromUri('...'),
  faceapi.nets.faceRecognitionNet.loadFromUri('...')
]);

// Detect & extract embedding
var detection = await faceapi
  .detectSingleFace(videoElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
  .withFaceLandmarks()
  .withFaceDescriptor();

if (!detection || !detection.descriptor) {
  // Wajah tidak terdeteksi
  return;
}

var embedding = Array.from(detection.descriptor); // Float32Array → number[]

// Save embedding
await apiRequest('/face-embeddings', {
  method: 'POST',
  body: JSON.stringify({ embeddings: embedding })
});
```

---

## 13. CSS Conventions

- Gunakan kelas dari `team-hub.css` dan `employee.css` untuk komponen standar
- CSS baru → buat file `assets/css/[feature].css`, jangan inline di HTML
- Inline styles HANYA untuk satu-off values (margin, display toggle)
- Jangan override `.att-table` tanpa tambah `.emp-table` — akan menyebabkan kolom overlap

**Import order (penting):**
```html
<link rel="stylesheet" href="../../assets/css/dashboard.css">  <!-- base: layout, nav, table base -->
<link rel="stylesheet" href="../../assets/css/team-hub.css">   <!-- buttons, cards, toast, modal -->
<link rel="stylesheet" href="../../assets/css/employee.css">   <!-- table reset, badges -->
<link rel="stylesheet" href="../../assets/css/[feature].css">  <!-- feature-specific -->
```

---

## 14. Konvensi Penamaan

| Item | Konvensi | Contoh |
|------|----------|--------|
| File halaman | `[feature]-[action].html` | `employee-detail.html` |
| File fetch | `[feature].js` | `fetch/report.js` |
| File render | `[feature].js` | `render/attendance.js` |
| File CSS | `[feature].css` | `report.css` |
| Fungsi fetch | `fetch[Resource]()` | `fetchAttendanceReport()` |
| Fungsi render | `map[Resource]Data()`, `build[Resource]Rows()` | `mapEmployeeData()` |
| ID elemen | `kebab-case` | `filter-year`, `rpt-tbody` |
| Variable state | `_camelCase` | `_data`, `_role`, `_userId` |
| CSS class | `kebab-case` dengan prefix | `rpt-badge`, `emp-empty` |
