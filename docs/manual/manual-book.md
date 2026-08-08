# Manual Book — Sanctuary HRIS
**Versi:** 1.0  
**Sistem:** Sanctuary HRIS — Human Resource Information System  
**Lingkungan:** Gaming House (Game Streaming)  

---

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Login & Onboarding](#2-login--onboarding)
3. [Peran Pengguna (Role)](#3-peran-pengguna-role)
4. [Dashboard](#4-dashboard)
5. [Absensi (Attendance)](#5-absensi-attendance)
6. [Manajemen Karyawan](#6-manajemen-karyawan)
7. [Cuti (Leave Request)](#7-cuti-leave-request)
8. [Jadwal Shift](#8-jadwal-shift)
9. [Team Hub](#9-team-hub)
10. [Laporan (Report)](#10-laporan-report)

---

## 1. Pendahuluan

Sanctuary HRIS adalah sistem manajemen kehadiran karyawan berbasis web yang dirancang khusus untuk lingkungan Gaming House. Sistem ini memverifikasi kehadiran menggunakan **biometrik wajah** (face recognition) dan **geolokasi GPS**, serta mengelola cuti, jadwal shift, laporan, dan data karyawan dengan sistem kontrol akses berbasis peran (RBAC — Role-Based Access Control) lima level.

### 1.1 Persyaratan Sistem

| Komponen | Kebutuhan |
|---|---|
| Browser | Google Chrome / Microsoft Edge (versi terbaru) |
| Koneksi Internet | Diperlukan untuk sinkronisasi data |
| Kamera | Diperlukan untuk absensi face recognition (Staff & Team Leader) |
| GPS / Lokasi | Diperlukan untuk validasi geolokasi saat clock-in |
| Resolusi Layar | Minimum 1280×720 |

### 1.2 Akses Sistem

Sistem dapat diakses melalui browser pada alamat yang diberikan oleh administrator.

---

## 2. Login & Onboarding

### 2.1 Halaman Login

![Halaman Login](screenshots/01-login.png)

Halaman login adalah pintu masuk utama sistem Sanctuary HRIS.

**Langkah login:**

1. Buka browser dan akses URL sistem
2. Masukkan **Email Address** yang terdaftar
3. Masukkan **Password**
4. Klik tombol **Authenticate**
5. Sistem akan mengarahkan ke dashboard sesuai peran pengguna

> **Catatan:** Jika lupa password, klik tautan **Forgot Password?** di bawah kolom password.

### 2.2 Alur Onboarding (Pengguna Baru)

Pengguna baru akan melalui alur onboarding berikut:

1. **Administrator** membuat akun pengguna baru
2. Sistem mengirimkan **email berisi link aktivasi** ke email yang didaftarkan
3. Pengguna membuka link → halaman **Set Password** → buat password baru
4. Sistem menyimpan sesi dan memeriksa status wajah (*face registration*)
5. Jika wajah **belum terdaftar** → sistem redirect ke halaman **Registrasi Wajah** secara otomatis
6. Pengguna merekam **5 sampel wajah** dengan pose berbeda:
   - Pose 1: Depan (Front)
   - Pose 2: Kiri (Left)
   - Pose 3: Kanan (Right)
   - Pose 4: Atas (Up)
   - Pose 5: Depan ke-2 (Front 2nd)
7. Setelah selesai → redirect ke halaman login
8. Login dengan email dan password yang baru dibuat

---

## 3. Peran Pengguna (Role)

Sanctuary HRIS memiliki 5 peran dengan hak akses berbeda:

| Peran | Label | Kewajiban Absen | Hak Akses Utama |
|---|---|---|---|
| `c_level` | C-Level | ❌ Tidak wajib | Full akses, approve cuti manajer |
| `hrd_manager` | HRD Manager | ✅ Shift tetap 10:00–18:00 (Senin–Jumat) | Kelola shift, approve cuti staff/team leader |
| `technical_manager` | Technical Manager | ✅ Shift tetap 13:00–21:00 (Senin–Jumat) | Akses dashboard, cuti di-approve C-Level |
| `team_leader` | Team Leader | ✅ Rotasi shift | Monitor tim, cuti di-approve HRD |
| `staff` | Staff | ✅ Rotasi shift | Dashboard personal, submit cuti |

### 3.1 Akses Menu per Peran

| Menu | C-Level | HRD Manager | Tech Manager | Team Leader | Staff |
|---|:---:|:---:|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Attendance | ✅ | ✅ | ✅ | ✅ | ✅ |
| Team Hub | ✅ | ✅ | ✅ | ✅ | ✅ |
| Leave Request | ❌ | ✅ | ✅ | ✅ | ✅ |
| Employee Management | ✅ | ✅ | ✅ | ❌ | ❌ |
| Shift Schedule | ✅ | ✅ | ✅ | ❌ | ❌ |
| Reports | ✅ | ✅ | ✅ | ✅ | Terbatas |

---

## 4. Dashboard

### 4.1 Dashboard HRD Manager / Technical Manager

![Dashboard Manager](screenshots/02-dashboard-manager.png)

Dashboard manager menampilkan ringkasan kondisi absensi seluruh karyawan hari ini.

**Elemen pada Dashboard Manager:**

| Elemen | Keterangan |
|---|---|
| Summary Card | Jumlah karyawan hadir, terlambat, tidak hadir, cuti |
| Tabel Absensi Hari Ini | Daftar status clock-in karyawan per shift |
| Notifikasi | Pengingat approval cuti yang menunggu |

### 4.2 Dashboard Staff

![Dashboard Staff](screenshots/14-dashboard-staff.png)

Dashboard staff menampilkan informasi personal karyawan.

**Elemen pada Dashboard Staff:**

| Elemen | Keterangan |
|---|---|
| Info Shift Hari Ini | Jadwal shift aktif (Pagi/Siang/Malam/Libur) |
| Status Absensi | Status clock-in sesi 1 dan sesi 2 |
| Rekap Absensi Bulan Ini | Total hadir, terlambat, tidak hadir |
| Sisa Cuti | Sisa kuota cuti tahunan dan sakit |

---

## 5. Absensi (Attendance)

### 5.1 Sistem Absensi

Sanctuary HRIS menggunakan sistem absensi **2 sesi per shift** tanpa clock-out:

| Sesi | Keterangan |
|---|---|
| **Sesi 1** | Clock-in di awal shift (masuk kerja) |
| **Sesi 2** | Clock-in setelah break/istirahat (kembali bekerja) |

**Jadwal Shift:**

| Shift | Jam Kerja | Jam Break | Berlaku untuk |
|---|---|---|---|
| Pagi | 06:00 – 14:00 | 09:30 – 10:30 | Staff & Team Leader |
| Siang | 14:00 – 22:00 | 17:30 – 18:30 | Staff & Team Leader |
| Malam | 22:00 – 06:00 | 01:30 – 02:30 | Staff & Team Leader |
| HRD | 10:00 – 18:00 | — | HRD Manager (Senin–Jumat) |
| Technical | 13:00 – 21:00 | — | Technical Manager (Senin–Jumat) |

**Rotasi Shift Staff & Team Leader:**  
2 hari Pagi → 2 hari Siang → 2 hari Malam → 2 hari Libur → (berulang)

### 5.2 Validasi Clock-In

Absensi divalidasi melalui dua metode:

| Metode | Keterangan | Toleransi |
|---|---|---|
| **Face Recognition** | Foto wajah dicocokkan dengan data biometrik terdaftar | Jarak Euclidean < 0.5 |
| **Geolokasi GPS** | Posisi karyawan diverifikasi terhadap lokasi kantor | Radius ≤ 50 meter |

> **Catatan:** Jika validasi gagal, absensi tetap dicatat sebagai `invalid` untuk keperluan audit. Karyawan **tidak diblokir** dari sistem.

> **Khusus Manager:** Clock-in dilakukan langsung tanpa face recognition dan geolokasi.

### 5.3 Halaman Absensi — HRD Manager

![Attendance Manager](screenshots/03-attendance-manager.png)

Tampilan absensi untuk HRD Manager menampilkan status kehadiran seluruh karyawan yang dikelola, lengkap dengan filter tanggal dan status.

**Fitur halaman Absensi Manager:**

- Filter berdasarkan tanggal
- Tampil status clock-in sesi 1 dan sesi 2 per karyawan
- Badge status: `Hadir`, `Terlambat`, `Tidak Hadir`, `Libur`
- Detail waktu clock-in per sesi

### 5.4 Halaman Absensi — Staff

![Attendance Staff](screenshots/15-attendance-staff.png)

Tampilan absensi untuk Staff menampilkan riwayat absensi personal dan tombol clock-in.

**Fitur halaman Absensi Staff:**

- Riwayat absensi bulanan personal
- Tombol **Clock In Sesi 1** dan **Clock In Sesi 2** (muncul sesuai jadwal)
- Proses clock-in memerlukan izin kamera dan lokasi
- Status tiap hari: `Hadir` / `Terlambat` / `Tidak Hadir` / `Libur`

**Langkah Clock-In (Staff):**

1. Buka halaman **Attendance**
2. Klik tombol **Clock In** sesuai sesi aktif
3. Izinkan akses **kamera** saat diminta browser
4. Izinkan akses **lokasi** saat diminta browser
5. Posisikan wajah di tengah frame kamera
6. Sistem memproses validasi wajah dan GPS secara otomatis
7. Konfirmasi hasil validasi ditampilkan

---

## 6. Manajemen Karyawan

> **Akses:** HRD Manager, Technical Manager, C-Level

### 6.1 Daftar Karyawan

![Employee Management](screenshots/04-employee-management.png)

Halaman manajemen karyawan menampilkan seluruh daftar karyawan aktif dalam sistem.

**Fitur halaman Employee Management:**

| Fitur | Keterangan |
|---|---|
| Tabel Karyawan | Nama, email, peran, status |
| Filter | Filter berdasarkan peran, status |
| Pencarian | Cari karyawan berdasarkan nama atau email |
| Tombol Add Employee | Tambah karyawan baru |
| Edit | Ubah data karyawan |
| Delete | Hapus karyawan dari sistem |
| Klik baris | Buka halaman detail karyawan |

### 6.2 Detail Karyawan

![Employee Detail](screenshots/06-employee-detail.png)

Halaman detail menampilkan informasi lengkap satu karyawan.

**Informasi yang ditampilkan:**

- Foto profil dan nama lengkap
- Email, peran, status (Aktif/Nonaktif)
- Data shift yang sedang berjalan
- Riwayat absensi karyawan
- Status face registration

### 6.3 Tambah Karyawan Baru

![Employee Create](screenshots/05-employee-create.png)

Form untuk menambahkan karyawan baru ke dalam sistem.

**Langkah tambah karyawan:**

1. Di halaman Employee Management, klik **Add Employee**
2. Isi formulir data karyawan:
   - Nama Lengkap
   - Email (akan digunakan sebagai username)
   - Peran (Role)
   - Status
3. Klik **Save / Submit**
4. Sistem mengirimkan **email onboarding** ke alamat yang diisi secara otomatis
5. Karyawan mengikuti alur onboarding (lihat Bagian 2.2)

---

## 7. Cuti (Leave Request)

### 7.1 Kebijakan Cuti

| Jenis Cuti | Kuota | Catatan |
|---|---|---|
| Cuti Tahunan (Annual) | 1 hari per bulan | Akumulasi per bulan |
| Cuti Sakit (Sick) | Sesuai kebutuhan | Wajib lampirkan surat dokter |

**Alur Persetujuan:**

| Pemohon | Disetujui oleh |
|---|---|
| Staff | HRD Manager |
| Team Leader | HRD Manager |
| HRD Manager | C-Level |
| Technical Manager | C-Level |

### 7.2 Halaman Leave Request — Manager

![Leave Request Manager](screenshots/07-leave-request-manager.png)

Tampilan leave request untuk Manager menampilkan dua tab:

| Tab | Keterangan |
|---|---|
| **My Requests** | Pengajuan cuti pribadi manajer |
| **All Employees** | Seluruh pengajuan cuti karyawan yang perlu di-review/approve |

**Aksi pada tab All Employees:**

- **Approve** — setujui pengajuan cuti
- **Reject** — tolak pengajuan dengan alasan

### 7.3 Halaman Leave Request — Staff

![Leave Request Staff](screenshots/16-leave-request-staff.png)

Tampilan leave request untuk Staff hanya menampilkan pengajuan cuti pribadi.

**Langkah mengajukan cuti (Staff):**

1. Buka menu **Leave Request**
2. Klik tombol **+ New Request** / **Ajukan Cuti**
3. Pilih jenis cuti: `Annual` atau `Sick`
4. Pilih tanggal mulai dan tanggal selesai
5. Isi alasan / keterangan
6. Jika cuti sakit: upload foto surat dokter
7. Klik **Submit**
8. Status pengajuan: `Pending` → `Approved` / `Rejected`

**Status Pengajuan Cuti:**

| Status | Keterangan |
|---|---|
| `Pending` | Menunggu persetujuan atasan |
| `Approved` | Disetujui, hari cuti dipotong dari kuota |
| `Rejected` | Ditolak, kuota tidak dipotong |

---

## 8. Jadwal Shift

> **Akses:** HRD Manager, Technical Manager, C-Level

### 8.1 Halaman Shift Schedule

![Shift Schedule](screenshots/08-shift-schedule.png)

Halaman Master Shift menampilkan jadwal shift seluruh karyawan dalam tampilan kalender/tabel.

**Fitur Shift Schedule:**

| Fitur | Keterangan |
|---|---|
| Kalender Shift | Tampilan jadwal mingguan/bulanan per karyawan |
| Filter Karyawan | Filter berdasarkan nama atau divisi |
| Warna Shift | Kode warna tiap jenis shift untuk identifikasi cepat |
| Hari Libur | Baris berwarna abu-abu |
| Override Shift | Baris berwarna kuning (jadwal yang diubah manual) |

**Kode Warna Shift:**

| Warna | Jenis Shift |
|---|---|
| 🟦 Biru | Pagi (06:00–14:00) |
| 🟨 Kuning | Siang (14:00–22:00) |
| 🟪 Ungu | Malam (22:00–06:00) |
| ⬜ Abu-abu | Libur |
| 🟧 Oranye | Override (perubahan jadwal) |

---

## 9. Team Hub

### 9.1 Halaman Team Hub

![Team Hub](screenshots/13-team-hub.png)

Team Hub menampilkan struktur tim dan informasi anggota tim secara keseluruhan.

**Fitur Team Hub:**

| Fitur | Keterangan |
|---|---|
| Daftar Tim | Semua tim yang ada di organisasi |
| Anggota Tim | Daftar anggota beserta peran masing-masing |
| Status Shift | Shift aktif anggota tim hari ini |
| Klik tim | Masuk ke halaman Team Detail untuk informasi lebih rinci |

### 9.2 Team Detail

Halaman Team Detail menampilkan informasi lengkap satu tim, termasuk:

- Nama dan foto anggota tim
- Peran setiap anggota (Team Leader / Staff)
- Status absensi hari ini per anggota
- Jadwal shift minggu berjalan

---

## 10. Laporan (Report)

> **Akses:** Semua peran Manager; Staff hanya akses laporan terbatas

Modul laporan terdiri dari 4 halaman yang dapat diakses melalui menu **Reports** di sidebar.

### 10.1 Laporan Absensi

![Report Attendance](screenshots/09-report-attendance.png)

Laporan rekap kehadiran karyawan per bulan.

**Filter yang tersedia:**

| Filter | Keterangan |
|---|---|
| Tahun | Pilih tahun laporan |
| Bulan | Pilih bulan laporan |

**Informasi yang ditampilkan:**

- Nama karyawan dan peran
- Total hari hadir, terlambat, tidak hadir
- Badge kelengkapan absensi (completion rate)
- Summary footer: total keseluruhan

**Ekspor:** Klik tombol **Export** untuk mengunduh laporan dalam format Excel/CSV.

### 10.2 Laporan Cuti

![Report Leave](screenshots/10-report-leave.png)

Laporan rekap penggunaan cuti karyawan per tahun.

**Filter yang tersedia:**

| Filter | Keterangan |
|---|---|
| Tahun | Pilih tahun laporan |

**Informasi yang ditampilkan:**

- Nama karyawan
- Total cuti diambil vs kuota tersedia
- Sisa cuti (kode warna: hijau = aman, kuning = sedikit, merah = habis)
- Rincian jenis cuti (tahunan vs sakit)

**Ekspor:** Klik tombol **Export** untuk mengunduh laporan.

### 10.3 Laporan Karyawan

![Report Employees](screenshots/11-report-employees.png)

Laporan data karyawan aktif dalam sistem.

**Filter yang tersedia:**

| Filter | Keterangan |
|---|---|
| Peran (Role) | Filter berdasarkan peran karyawan |
| Status | Filter: Aktif / Nonaktif |
| Manager | Filter berdasarkan manajer yang menaungi |

**Informasi yang ditampilkan:**

- Data lengkap karyawan: nama, email, peran, status
- Tanggal bergabung
- Status face registration

**Ekspor:** Klik tombol **Export** untuk mengunduh data karyawan.

### 10.4 Laporan Jadwal Shift

![Report Shifts](screenshots/12-report-shifts.png)

Laporan rekap jadwal shift karyawan.

**Informasi yang ditampilkan:**

- Jadwal shift tiap karyawan per periode
- Baris abu-abu: hari libur
- Baris kuning: jadwal yang di-override

**Ekspor:** Klik tombol **Export** untuk mengunduh laporan jadwal shift.

---

## Lampiran A — Panduan Troubleshooting

| Masalah | Kemungkinan Penyebab | Solusi |
|---|---|---|
| Tidak bisa login | Password salah / akun belum aktif | Klik "Forgot Password" atau hubungi HRD |
| Clock-in gagal — wajah tidak dikenali | Pencahayaan kurang / pose tidak sesuai | Pastikan cahaya cukup, posisikan wajah lurus ke kamera |
| Clock-in gagal — lokasi tidak valid | Di luar radius 50m dari kantor | Pastikan berada di area kantor, aktifkan GPS |
| Halaman tidak bisa dibuka | Sesi login expired | Refresh halaman dan login ulang |
| Data tidak muncul | Koneksi ke server terputus | Periksa koneksi internet, refresh halaman |

---

## Lampiran B — Kontak & Dukungan

Untuk pertanyaan teknis dan bantuan penggunaan sistem, hubungi:

- **HRD Manager** — untuk permasalahan absensi, cuti, dan akun karyawan
- **Technical Manager** — untuk permasalahan teknis dan gangguan sistem
- **Administrator Sistem** — untuk reset password dan pembuatan akun baru

---

*Dokumen ini dibuat secara otomatis oleh sistem dokumentasi Sanctuary HRIS.*  
*Tanggal: Agustus 2026*
