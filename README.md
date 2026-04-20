# HRIS Frontend

Frontend web statis untuk HRIS Attendance System pada operasional Gaming House.
Project ini dibuat dengan HTML, CSS, dan Vanilla JavaScript, lalu berkomunikasi
dengan backend REST API lokal.

## Overview

Sistem HRIS ini berfokus pada absensi karyawan dengan validasi identitas dan
lokasi:

- Face recognition untuk verifikasi biometrik.
- Geo-tagging untuk validasi lokasi absensi.
- JWT authentication untuk sesi login.
- Role-Based Access Control sesuai struktur Gaming House.
- Flow absensi berbasis sesi, bukan clock-out konvensional.

Frontend saat ini menyediakan halaman login, reset access mock flow, dan halaman
dashboard sederhana setelah login berhasil. Halaman login dan reset access sudah
dipisah ke file HTML masing-masing.

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- Browser desktop
- Lucide icon CDN
- Backend target: PHP Native REST API + MySQL

## Struktur File

```text
.
├── index.html
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── config.js
│       ├── api.js
│       └── auth.js
├── pages/
│   ├── login.html
│   ├── reset-access.html
│   └── dashboard.html
├── docs/
│   ├── flow.md
│   ├── hris.md
│   └── hris_architecture_v2.md
└── README.md
```

## Cara Menjalankan Frontend

Karena project ini adalah static frontend, tidak perlu install dependency.
Jalankan static server dari root project:

```bash
cd /Users/apple/Documents/kuliah/hris-frontend
python3 -m http.server 5500
```

Buka browser:

```text
http://localhost:5500/index.html
```

`index.html` akan otomatis mengarah ke:

```text
pages/login.html
```

## Konfigurasi API

Karena frontend ini masih HTML/JS biasa tanpa bundler, `.env` dibaca oleh
`assets/js/config.js` lewat request ke `/.env` saat aplikasi berjalan di static
server.

```js
var data = await apiRequest('/login', {
  method: 'POST',
  body: JSON.stringify({ email: email, password: password })
});
```

Jika port atau host backend berubah, cukup update nilai `URL_LOCAL` di `.env`.
Jangan simpan secret di `.env` frontend karena file ini bisa diakses browser
saat static server berjalan.

## Login Flow

1. User membuka `index.html` atau langsung `pages/login.html`.
2. User mengisi email dan password.
3. Frontend mengirim request ke `POST /api/login`.
4. Jika response sukses dan memiliki token:
   - token disimpan ke `localStorage` sebagai `hris_token`
   - data user disimpan ke `localStorage` sebagai `hris_user`
   - user diarahkan ke `pages/dashboard.html`
5. Jika gagal, pesan error ditampilkan di halaman login.

Expected response backend:

```json
{
  "success": true,
  "message": "Login success",
  "data": {
    "token": "jwt-token",
    "user": {
      "id": 1,
      "name": "User Name",
      "email": "user@example.com",
      "role": "staff"
    }
  }
}
```

## Role Sistem

Role bisnis yang digunakan pada versi Gaming House:

- `c_level`: akses tertinggi, melihat report dan approve cuti manager, tidak wajib absensi.
- `hrd_manager`: mengelola user, shift, report, dan approve cuti staff/team leader.
- `technical_manager`: manager teknis dengan jam kerja tetap dan akses dashboard summary.
- `team_leader`: mengikuti rotasi shift dan memantau tim.
- `staff`: role umum untuk talent/streamer dan karyawan operasional.

## Flow Shift

Staff dan team leader menggunakan rotasi otomatis:

```text
2 hari shift pagi -> 2 hari shift siang -> 2 hari shift malam -> 2 hari libur
```

Detail shift:

| Shift | Jam Kerja | Jam Istirahat |
| --- | --- | --- |
| Pagi | 06:00 - 14:00 | 09:30 - 10:30 |
| Siang | 14:00 - 22:00 | 17:30 - 18:30 |
| Malam | 22:00 - 06:00 | 01:30 - 02:30 |

Manager menggunakan jadwal tetap:

| Role | Jam Kerja | Hari Kerja |
| --- | --- | --- |
| HRD Manager | 10:00 - 18:00 | Senin - Jumat |
| Technical Manager | 13:00 - 21:00 | Senin - Jumat |

## Flow Absensi

Absensi Gaming House tidak memakai clock-out. Setiap shift memakai dua sesi:

1. Session 1: absensi awal shift.
2. Session 2: absensi saat mulai sesi kerja/stream kedua.

Validasi absensi:

- Face recognition menggunakan face-api.js di client-side.
- Face embedding dibandingkan memakai Euclidean Distance.
- Match jika distance kurang dari `0.5`.
- Lokasi divalidasi dengan `navigator.geolocation`.
- Jarak dihitung menggunakan Haversine Formula.
- Radius valid maksimal `50 meter`.
- Toleransi keterlambatan maksimal `15 menit` untuk setiap sesi.

Kegagalan face atau lokasi tetap perlu tercatat di backend sebagai audit log
untuk kebutuhan monitoring fraud.

## Flow Cuti

Aturan cuti:

- Setiap karyawan mendapat 1 hari cuti per bulan.
- Staff dan team leader membutuhkan approval HRD Manager.
- HRD Manager dan Technical Manager membutuhkan approval C-Level.
- Izin sakit wajib melampirkan surat dokter.

## Dokumen Referensi

- `docs/flow.md`: meeting notes dan aturan bisnis Gaming House.
- `docs/hris.md`: technical specification awal HRIS attendance.
- `docs/hris_architecture_v2.md`: arsitektur backend dan flow terbaru untuk Gaming House.

## Development Notes

- Jangan gunakan Laravel, React, atau backend Python untuk scope versi ini.
- Frontend tetap ringan dengan HTML/CSS/Vanilla JS.
- Backend menggunakan PHP Native, PDO, MySQL, dan JWT.
- Face recognition menggunakan pretrained model melalui face-api.js.
- Tidak ada training ML di backend.
- Gunakan prepared statements pada backend untuk akses database.
