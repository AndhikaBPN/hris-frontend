# PRD — Sanctuary HRIS Frontend
**Version:** 2.0 | **Stack:** Static HTML / CSS / Vanilla JS | **Backend:** PHP Native REST API

---

## 1. Product Overview

Sanctuary HRIS adalah sistem manajemen kehadiran karyawan berbasis web untuk **Gaming House** (game streaming environment). Sistem ini memverifikasi kehadiran menggunakan **biometrik wajah** (face-api.js) dan **geolocation** (Haversine), serta mengelola cuti, shift, laporan, dan data karyawan dengan role-based access control (RBAC) lima level.

**Backend:** `http://localhost:8000` (PHP Native + JWT)  
**Frontend:** Served via Node.js static server di `http://localhost:3000`

---

## 2. User Roles

| Role | Label | Kewajiban Absen | Catatan |
|------|-------|-----------------|---------|
| `c_level` | C-Level | ❌ Tidak | Full access, approve cuti manajer |
| `hrd_manager` | HRD Manager | ✅ Fixed shift 10:00–18:00 (Senin–Jumat) | Manage shift, approve cuti staff/TL |
| `technical_manager` | Technical Manager | ✅ Fixed shift 13:00–21:00 (Senin–Jumat) | Dashboard access, cuti di-approve c_level |
| `team_leader` | Team Leader | ✅ Rotasi shift | Monitor tim, cuti di-approve HRD |
| `staff` | Staff | ✅ Rotasi shift | Dashboard personal, submit cuti |

**Rotasi Shift (staff & team_leader):** 2 hari Pagi → 2 hari Siang → 2 hari Malam → 2 hari Libur (berulang)

---

## 3. Feature Modules

### 3.1 Autentikasi
- Login dengan email + password → JWT disimpan di `localStorage.hris_token`
- Logout → hapus token, redirect ke login
- **Password Reset (Onboarding Flow):**
  1. Email berisi link ke `/set-password?email=...&token=...`
  2. User set password baru → `POST /password/reset`
  3. Jika `has_face_registered = false` → redirect ke `/pages/face-sample/face-sample.html?onboarding=true`
  4. Jika sudah ada face → redirect ke login

### 3.2 Dashboard (Role-Specific)
- `staff` → `dashboard-staff.html` — ringkasan absensi personal, jadwal hari ini
- `team_leader` → `dashboard-teamlead.html` — ringkasan absensi tim
- `hrd_manager` / `technical_manager` → `dashboard-manager.html` — summary admin
- `c_level` → `dashboard-clevel.html` — attendance manager + staff, data cuti

### 3.3 Attendance (Absensi)
**Session-based, tanpa clock-out.** Setiap shift punya 2 sesi:
- **Session 1:** Clock-in awal shift
- **Session 2:** Clock-in setelah break/sesi kedua

**Validasi (staff & team_leader):**
- Face recognition: Euclidean distance < 0.5 (via face-api.js)
- GPS Geolocation: jarak ≤ 50m dari koordinat kantor (Haversine)
- Keterlambatan: > 15 menit dari `start_time` → status `late`
- Gagal validasi TIDAK memblokir submit — dicatat sebagai `invalid` untuk audit

**Manager (hrd/technical):** Clock-in langsung, tidak perlu face/geo.

### 3.4 Leave Request (Cuti)
- Jenis cuti: `annual` (1 hari/bulan) dan `sick` (wajib lampir surat dokter)
- **Submit:** `POST /leave` dengan `leave_date_from`, `leave_date_to`, `leave_type`, `reason`, `doctor_letter` (opsional)
- **Filter list:** `leave_type`, `status`, `date_from`, `date_to`, `search`
- **Approval flow:**
  - staff / team_leader → diapprove oleh `hrd_manager`
  - hrd_manager / technical_manager → diapprove oleh `c_level`
- **Endpoints:** `PUT /leave/{id}/approve`, `PUT /leave/{id}/reject`
- **Quota:** `GET /leave/quota` → `{ total_quota, total_used, remaining_quota }`
- UI: Tab "My Requests" vs "All Employees" (hanya untuk manager/c_level)

### 3.5 Team Hub
- List tim dengan member count, team leader info
- Detail tim: list member, roles, status
- Access: semua role kecuali staff (read-only)

### 3.6 Employee Management
- List karyawan dengan filter role, status, search
- Detail karyawan: info personal + employment
- Create / Update karyawan
- **Manage Face Sample** (hrd_manager & technical_manager):
  - List face samples (maks 5) dengan pose sequence
  - Retake per sample (edit mode)
  - Add sample jika count < 5
  - Navigasi via `sessionStorage` (key: `manageFaceSampleUserId`, `manageFaceSampleMode`, `manageFaceSamplePoseIndex`, `manageFaceSampleId`)
- Access: `c_level`, `hrd_manager`, `technical_manager`

**Pose sequence face sample:**
| # | Nama | Instruksi |
|---|------|-----------|
| 1 | Front | Look straight at the camera |
| 2 | Left | Turn head slightly to the LEFT |
| 3 | Right | Turn head slightly to the RIGHT |
| 4 | Up | Tilt chin slightly UPWARD |
| 5 | Front (2nd) | Look straight at the camera again |

### 3.7 Shift Schedule Management
- Master shifts: Pagi, Siang, Malam, HRD, Technical
- Schedule list dengan filter name, team, date range, is_day_off
- **Add:** Single (1 user × 1 date) atau Bulk (multi user × multi date) atau Import Excel
- **Edit:** Single atau Bulk (setiap row bisa shift berbeda)
- **Delete:** Single schedule
- Past-date protection: tanggal lewat tidak bisa diedit (backend return 422)
- Access: `c_level`, `hrd_manager`

**API shift-schedule:**
- `GET /shift-schedules/my` — jadwal sendiri
- `GET /shift-schedules` — semua jadwal (admin)
- `POST /shift-schedules` — tambah single
- `POST /shift-schedules/bulk` — tambah bulk
- `POST /shift-schedules/import` — import Excel (multipart/form-data)
- `PUT /shift-schedules/{id}` — update single
- `PUT /shift-schedules/bulk` — update bulk (array of objects)
- `DELETE /shift-schedules/{id}` — hapus

### 3.8 Face Sample Registration
**Onboarding:** Halaman standalone `face-sample.html?onboarding=true` — tanpa sidebar/navbar
**Normal:** Halaman dengan sidebar untuk re-registration
- Wajib 5 sample dengan pose sequence
- Setiap sample: capture via webcam → `faceapi.detectSingleFace()` → `Array.from(detection.descriptor)` → `POST /face-embeddings`
- Face-api.js models: SsdMobilenetv1, FaceLandmark68Net, FaceRecognitionNet
- Selesai → redirect ke login (onboarding) atau profile

### 3.9 Report Module
Semua report: filter, table, footer summary, Export XLSX + PDF (dengan auth header).

| Report | Route | Endpoint | Kolom Utama |
|--------|-------|----------|-------------|
| Attendance | `/report/attendance` | `GET /reports/attendance?year=&month=` | Name, Role, Scheduled, Present, Late, Absent, Session 1%, Session 2%, Invalid |
| Leave | `/report/leave` | `GET /reports/leave?year=` | Name, Role, Total Quota, Annual Used, Sick Used, Remaining, Pending, Rejected |
| Employees | `/report/employees` | `GET /reports/employees?role=&status=&manager_id=` | Name, Email, Phone, Role, Manager, Join Date, Status |
| Shift Schedule | `/report/shifts` | `GET /reports/shifts?year=&month=` | Name, Date, Shift, Start, End, Day Off, Override, Notes |

**Export:** `GET /reports/{type}/export?format=xlsx|pdf&...filters` — response blob, trigger download dengan auth Bearer header.

**Role behavior report:**
- `staff`: data diri sendiri, filter search name disembunyikan
- `team_leader`: data tim sendiri
- `c_level`, `hrd_manager`, `technical_manager`: semua data

---

## 4. Navigation & Sidebar

**Collapsible Reports group** di sidebar:
```
Dashboard
Attendance
Team Hub
Leave Request
Employee Management    ← hidden: staff, team_leader
Shift Schedule         ← hidden: staff, team_leader
Reports ▸              ← collapsible, visible semua role
  ├ Attendance Report
  ├ Leave Report
  ├ Employees Report   ← hidden: staff
  └ Shift Schedule Report
```

---

## 5. API Reference

**Base URL:** `http://localhost:8000/api` (via `getApiUrl()`)  
**Auth:** Header `Authorization: Bearer <token>` (auto via `apiRequest()`)

| Endpoint | Method | Roles | Deskripsi |
|----------|--------|-------|-----------|
| `/login` | POST | Public | Login, return JWT + user |
| `/logout` | POST | All | Logout |
| `/password/reset` | POST | Public | Reset password + return JWT |
| `/profile` | GET | All | Get profil + `has_face_registered` |
| `/users` | GET, POST | c_level, hrd | List/create user |
| `/users/{id}` | PUT, DELETE | c_level, hrd | Update/delete user |
| `/employees` | GET | c_level, hrd, tech | List karyawan dengan filter |
| `/employees/{id}` | GET | c_level, hrd, tech | Detail karyawan |
| `/shifts` | GET | All | Master shift list |
| `/shift-schedules` | GET | c_level, hrd, tech | List semua jadwal |
| `/shift-schedules/my` | GET | All | Jadwal sendiri |
| `/shift-schedules` | POST | c_level, hrd | Add single |
| `/shift-schedules/bulk` | POST | c_level, hrd | Add bulk |
| `/shift-schedules/import` | POST | c_level, hrd | Import Excel |
| `/shift-schedules/{id}` | PUT, DELETE | c_level, hrd | Edit/hapus |
| `/shift-schedules/bulk` | PUT | c_level, hrd | Edit bulk |
| `/attendance/clock-in` | POST | hrd, tech, tl, staff | Clock-in session |
| `/attendance/my` | GET | All | Attendance history sendiri |
| `/face-embeddings` | GET, POST | All | List/tambah embedding |
| `/face-embeddings/{userId}` | GET | hrd, tech | Embedding by user ID |
| `/face-embeddings/{id}` | PUT | hrd, tech | Update embedding |
| `/leave` | GET, POST | All | List/submit cuti |
| `/leave/quota` | GET | All | Sisa cuti |
| `/leave/{id}/approve` | PUT | c_level, hrd | Approve cuti |
| `/leave/{id}/reject` | PUT | c_level, hrd | Reject cuti |
| `/office-locations` | GET | All | Koordinat kantor |
| `/dashboard/staff` | GET | tl, staff | Dashboard personal |
| `/dashboard/admin` | GET | c_level, hrd, tech | Dashboard admin |
| `/reports/attendance` | GET | All | Data report absensi |
| `/reports/leave` | GET | All | Data report cuti |
| `/reports/employees` | GET | All except staff | Data report karyawan |
| `/reports/shifts` | GET | All | Data report shift |
| `/reports/{type}/export` | GET | All | Export file (blob) |

---

## 6. Technical Constraints

- Tidak ada framework JS atau build tools
- Tidak ada `npm install` untuk frontend
- CDN libraries: face-api.js (`@vladmandic/face-api@1.7.14`), Lucide icons
- `localStorage`: `hris_token` (JWT), `hris_user` (JSON)
- `sessionStorage`: navigasi state antar halaman (employee ID, face sample context)
- 401 response → auto logout + redirect login (via `api.js` interceptor)
- `.env` berisi `URL_LOCAL=http://localhost:8000` — TIDAK untuk secrets

---

## 7. Response Format

```json
{
  "success": true,
  "message": "OK",
  "data": { ... },
  "meta": { "current_page": 1, "last_page": 3, "per_page": 10, "total_records": 25 }
}
```

Error:
```json
{ "success": false, "message": "Error description", "data": null }
```
