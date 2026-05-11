# Face Recognition Flow - Penjelasan Bahasa Manusia

## Pendahuluan

Sistem face recognition digunakan untuk memverifikasi identitas karyawan saat melakukan clock-in. Sistem ini membandingkan wajah karyawan yang ditangkap saat clock-in dengan data wajah yang sudah tersimpan sebelumnya di dalam database.

**Tujuan:** Memastikan yang melakukan clock-in adalah benar-benar karyawan yang terdaftar, bukan orang lain.

---

## Fase 1: Pendaftaran Wajah (Enrollment)

### Kapan dilakukan?
Saat karyawan pertama kali mendaftar atau setup akun baru di sistem HRIS.

### Langkah-langkah:

#### Langkah 1: Karyawan mengambil foto wajah
Karyawan difoto wajahnya menggunakan kamera atau smartphone dengan kondisi:
- Pencahayaan cukup terang
- Wajah menghadap langsung ke kamera (frontal)
- Tidak ada penghalang (kacamata, masker, etc)
- Background netral jika memungkinkan

#### Langkah 2: Sistem menganalisis foto wajah
Sistem menggunakan teknologi face detection untuk:
- Mencari dan menemukan wajah di dalam foto
- Jika ditemukan lebih dari 1 wajah, sistem akan menolak (hanya boleh 1 wajah)
- Jika tidak ada wajah terdeteksi, minta user ambil foto ulang

#### Langkah 3: Sistem mengekstrak karakteristik wajah
Setelah wajah terdeteksi, sistem mengekstrak fitur-fitur unik dari wajah tersebut:
- Jarak antar mata
- Bentuk hidung
- Struktur rahang
- Proporsi wajah
- Posisi telinga

Semua karakteristik ini dikonversi menjadi **representasi numerik** (angka-angka) yang disebut "embedding wajah" atau "face descriptor". Embedding ini adalah array berisi 128 angka yang merepresentasikan wajah secara unik.

#### Langkah 4: Sistem menyimpan embedding ke database
Embedding wajah disimpan ke database dengan asosiasi ke user ID karyawan tersebut:
- User ID → wajah embedding (array 128 angka)
- Foto asli TIDAK disimpan (hanya embedding numeriknya)

Alasan tidak menyimpan foto: hemat storage, lebih aman, dan lebih cepat untuk comparison.

#### Langkah 5: Registrasi selesai
Karyawan sekarang sudah ready untuk melakukan clock-in menggunakan face recognition.

---

## Fase 2: Verifikasi Wajah saat Clock-In

### Kapan dilakukan?
Setiap kali karyawan (khususnya staff dan team leader) melakukan clock-in untuk attendance.

### Langkah-langkah:

#### Langkah 1: Karyawan membuka aplikasi dan masuk ke halaman clock-in
Karyawan membuka aplikasi HRIS di web browser dan navigasi ke halaman clock-in attendance.

#### Langkah 2: Sistem meminta izin akses camera
Browser akan menampilkan pop-up asking for camera permission. Karyawan harus klik "Allow" atau "Izinkan" untuk memberikan akses ke kamera.

Jika karyawan menolak:
- Sistem akan menampilkan error message
- Clock-in tidak bisa lanjut
- Karyawan harus enable camera di browser settings

#### Langkah 3: Kamera aktif dan menampilkan live preview
Setelah izin diberikan, kamera smartphone/laptop akan aktif. Karyawan bisa melihat wajahnya sendiri di layar (live preview).

#### Langkah 4: Karyawan mengambil posisi yang benar
Karyawan harus:
- Posisikan wajah di tengah-tengah layar
- Pastikan pencahayaan cukup terang (tidak terlalu gelap)
- Tunggu beberapa detik hingga sistem siap capture

#### Langkah 5: Sistem menangkap gambar wajah
Setelah user siap, sistem otomatis menangkap 1 frame/gambar dari video stream kamera sebagai snapshot wajah saat itu.

#### Langkah 6: Sistem mendeteksi wajah di gambar yang ditangkap
Sistem menganalisis gambar yang baru ditangkap untuk:
- Menemukan apakah ada wajah di dalam gambar
- Jika ada lebih dari 1 wajah → tolak (hanya boleh 1 orang)
- Jika tidak ada wajah → tampilkan error "Wajah tidak terdeteksi" → minta user coba lagi

#### Langkah 7: Sistem mengekstrak karakteristik wajah dari gambar
Sama seperti fase registrasi, sistem mengekstrak fitur-fitur wajah unik dari gambar yang baru ditangkap dan mengkonversinya menjadi embedding (array 128 angka).

#### Langkah 8: Sistem mengambil embedding yang tersimpan dari database
Sistem mencari dan mengambil embedding wajah yang sudah tersimpan untuk karyawan tersebut dari database.

#### Langkah 9: Sistem membandingkan kedua embedding
Sistem membandingkan:
- Embedding yang baru ditangkap (saat clock-in)
- Embedding yang tersimpan di database (saat registrasi)

Perbandingan dilakukan dengan menghitung **Euclidean Distance** (jarak geometris) antara kedua array angka.

**Analogi:** Bayangkan 2 titik di ruang 3D (atau 128D dalam hal ini). Semakin dekat jarak kedua titik, semakin mirip wajahnya.

Cara menghitung:
- Untuk setiap pasang angka di kedua array, hitung selisihnya
- Kuadratkan setiap selisih
- Jumlahkan semua kuadrat tersebut
- Akar kuadrat hasil penjumlahan

Hasilnya adalah 1 angka (distance value).

#### Langkah 10: Sistem membandingkan distance dengan threshold
Sistem memiliki threshold/batasan standar: **0.5**

Interpretasi hasil:
- **Distance < 0.5**: Wajah cocok (same person) ✓
  - Semakin kecil distance, semakin yakin match-nya
  - Distance 0.0-0.3: Very high confidence
  - Distance 0.3-0.5: Valid match

- **Distance ≥ 0.5**: Wajah tidak cocok (different person) ✗
  - Bisa karena orang berbeda, atau kondisi capture tidak optimal

#### Langkah 11A: Jika wajah COCOK (Distance < 0.5)
- Sistem menampilkan pesan sukses: "Wajah berhasil diverifikasi"
- Confidence score ditampilkan (contoh: "Confidence 95%")
- System proceed ke tahap berikutnya: **Geolocation validation**

#### Langkah 11B: Jika wajah TIDAK COCOK (Distance ≥ 0.5)
- Sistem menampilkan error message: "Wajah tidak cocok. Distance: [angka]"
- Sistem menampilkan prompt: "Coba lagi?"
- Karyawan punya opsi:
  - **Retry**: Kembali ke Langkah 3 (kamera aktif lagi, coba capture ulang)
  - **Cancel**: Batalkan clock-in, proses dihentikan

#### Langkah 12: Retry logic (jika perlu)
Jika karyawan coba lagi:
- Kamera aktif kembali
- User bisa adjust posisi/lighting
- Capture ulang dan bandingkan lagi
- Maksimal bisa retry beberapa kali (TBD - tentukan by policy)

Jika tetap gagal setelah beberapa retry:
- Tampilkan error final: "Verifikasi wajah gagal berkali-kali. Hubungi admin."
- Clock-in ditolak

---

## Faktor-Faktor yang Mempengaruhi Akurasi

### Faktor yang membuat face recognition AKURAT:
1. **Pencahayaan baik** - Wajah terang dan jelas terlihat
2. **Wajah menghadap kamera** - Frontal view (tidak miring/profile)
3. **Jarak optimal** - Wajah tidak terlalu dekat atau terlalu jauh
4. **Background clean** - Latar belakang sederhana, tidak berantakan
5. **Tidak ada penghalang** - Wajah tidak tertutup masker, kacamata, dll
6. **Ekspresi netral** - Wajah relaks, tidak tersenyum atau mengkerut
7. **Kondisi mirip registrasi** - Lingkungan serupa dengan saat pendaftaran

### Faktor yang membuat face recognition TIDAK AKURAT:
1. **Pencahayaan buruk** - Terlalu gelap atau contre-light
2. **Wajah miring/profile** - Sudut pandang yang ekstrem
3. **Ada penghalang** - Masker, topi, kacamata, rambut memanjang
4. **Ekspresi berubah drastis** - Tertawa, marah, atau serius
5. **Makeup berat** - Makeup yang berbeda drastis dari registrasi
6. **Kamera blur/tidak fokus** - Gambar tidak jelas
7. **Terlalu banyak orang** - Lebih dari 1 wajah di frame

---

## Skenario Error dan Recovery

### Skenario 1: "Wajah tidak terdeteksi"
- **Penyebab**: Gambar blur, lighting gelap, wajah terlalu jauh/dekat
- **Recovery**: Adjust pencahayaan, align wajah ke tengah, coba lagi

### Skenario 2: "Lebih dari 1 wajah terdeteksi"
- **Penyebab**: Ada orang lain di background
- **Recovery**: Pastikan hanya 1 orang di frame, coba lagi

### Skenario 3: "Wajah tidak cocok" (Distance > 0.5)
- **Penyebab**: Orang berbeda, makeup berat, kondisi capture berbeda
- **Recovery**: Pastikan yang capture adalah orang yang terdaftar, improve lighting, coba lagi

### Skenario 4: "Camera permission denied"
- **Penyebab**: Browser tidak dikasih izin akses camera
- **Recovery**: Enable camera di browser settings atau gunakan device lain

### Skenario 5: "Model tidak loaded"
- **Penyebab**: Sistem gagal load face recognition model
- **Recovery**: Refresh halaman, check koneksi internet, contact admin

---

## Role-Based Flow

### Untuk STAFF dan TEAM LEADER:
Face recognition adalah **MANDATORY** untuk setiap clock-in.

Alur:
1. Clock-in
2. Face recognition validation (WAJIB)
3. Jika pass → Geolocation validation (WAJIB)
4. Jika pass → Attendance recorded

### Untuk HRD MANAGER dan TECHNICAL MANAGER:
Face recognition adalah **OPTIONAL**. Mereka cukup clock-in tanpa face/geo validation.

Alur:
1. Clock-in (langsung recorded, tidak perlu validasi apapun)
2. Attendance recorded

**Alasan**: Manager punya fixed shift dan fixed office, tidak perlu geolocation check.

---

## Data yang Disimpan

Setiap kali face recognition berhasil, sistem simpan:
1. **User ID**: Siapa yang melakukan clock-in
2. **Timestamp**: Kapan clock-in dilakukan
3. **Face Distance**: Angka distance yang didapat (contoh: 0.23)
4. **Status**: "valid" (karena face recognized)

Data ini disimpan ke database untuk:
- Audit trail (rekam jejak siapa clock-in kapan)
- Fraud detection (jika pattern aneh, bisa di-flag)
- Analytics (statistik absen)

---

## Privacy dan Security

### Data Privacy:
- Hanya **embedding** yang disimpan, bukan foto asli
- Embedding adalah angka abstract, tidak bisa di-reverse jadi foto
- User bisa request delete data wajahnya anytime

### Security:
- Face recognition dilakukan **client-side** (di browser user), bukan server
- Tidak ada data transfer wajah ke server
- HTTPS dibutuhkan (secure connection)
- Embedding disimpan dengan encryption di database

---

## Timeline Proses Face Recognition

```
Total waktu: 1-3 detik

├─ Load face model: 200-500ms
├─ Capture image: 100ms
├─ Detect face: 100-300ms
├─ Extract descriptor: 50-100ms
├─ Calculate distance: <1ms
└─ Compare & respond: <10ms
```

Karyawan akan merasakan proses ini hampir instant (dalam hitungan 1-3 detik).

---

## Best Practices untuk Karyawan

1. **Saat Registrasi**: Ambil foto di ruangan dengan pencahayaan bagus, wajah frontal
2. **Saat Clock-In**: Pastikan lokasi pencahayaan serupa dengan saat registrasi
3. **Hindari Masker**: Buka masker saat face recognition jika bisa
4. **Jangan Zoom**: Jangan zoom camera, biarkan face recognition handle distance
5. **Network**: Pastikan internet stabil, face model perlu load
6. **Retry dengan Sabar**: Jika gagal, adjust kondisi dan coba lagi, jangan menyerah

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| "Camera not found" | Pastikan device punya camera, atau gunakan device lain |
| "Wajah tidak terdeteksi terus" | Improve lighting, clean camera lens, align wajah ke center |
| "Wajah tidak cocok padahal orang yang benar" | Registrasi ulang wajah dengan kondisi lighting lebih baik |
| "Browser hang/freeze" | Refresh halaman, clear browser cache, atau gunakan browser lain |
| Performa lambat | Check internet speed, close background apps, device mungkin overheating |

---

## Kesimpulan

Face recognition adalah layer pertama validasi untuk attendance verification. Sistemnya:
- **Otomatis**: User tinggal capture wajah, sistem analyze
- **Cepat**: Selesai dalam 1-3 detik
- **Akurat**: Dengan threshold 0.5, accuracy tinggi untuk scenario normal
- **User-Friendly**: Jika gagal, user bisa retry sampai sukses

Setelah face recognition pass, sistem proceed ke geolocation validation sebagai layer kedua untuk double-check identitas dan lokasi karyawan.
