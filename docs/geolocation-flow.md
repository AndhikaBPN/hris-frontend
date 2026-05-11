# Geolocation Flow - Penjelasan Bahasa Manusia

## Pendahuluan

Geolocation adalah sistem validasi lokasi untuk memastikan karyawan benar-benar berada di kantor saat melakukan clock-in. Sistem ini menggunakan GPS dari smartphone/device untuk menangkap koordinat lokasi karyawan dan membandingkannya dengan koordinat lokasi kantor yang sudah tersimpan di database.

**Tujuan**: Mencegah karyawan melakukan clock-in dari tempat lain (rumah, kafe, dll) dan memastikan mereka berada di lokasi kerja yang seharusnya.

---

## Fase 1: Setup Awal - Menyimpan Lokasi Kantor

### Kapan dilakukan?
Sekali waktu saat sistem pertama kali di-setup. Dilakukan oleh admin/HRD manager.

### Langkah-langkah:

#### Langkah 1: Admin menentukan koordinat kantor
Admin atau HRD manager pergi ke lokasi kantor yang sesungguhnya (dengan GPS yang akurat).

#### Langkah 2: Mengukur koordinat GPS kantor
Admin menggunakan GPS dari smartphone atau aplikasi mapping untuk mendapatkan koordinat eksak kantor:
- **Latitude** (garis lintang): Contoh -6.17553
- **Longitude** (garis bujur): Contoh 106.82714

Koordinat ini adalah titik "pusat" kantor, biasanya di pintu masuk atau lobby.

#### Langkah 3: Admin menyimpan koordinat ke database
Koordinat kantor disimpan ke database sebagai "Office Location" (1 koordinat untuk 1 kantor).

Contoh yang disimpan:
- Nama: "Gaming House HQ"
- Latitude: -6.17553
- Longitude: 106.82714
- Radius: 50 meter

#### Langkah 4: Sistem ready untuk geolocation validation
Database sekarang punya data lokasi kantor yang fixed. Semua clock-in akan dibandingkan dengan koordinat ini.

---

## Fase 2: Geolocation Validation saat Clock-In

### Kapan dilakukan?
Setiap kali karyawan (staff dan team leader saja) melakukan clock-in, SETELAH face recognition berhasil.

**Urutan penting**: Face validation dulu, baru geolocation. Geolocation tidak berjalan jika face gagal.

### Langkah-langkah:

#### Langkah 1: Karyawan selesai face recognition dengan sukses
Sebelum sampai ke geolocation, karyawan harus lulus face recognition validation.

Jika face gagal, geolocation tidak akan dijalankan (langsung abort).

#### Langkah 2: Sistem menampilkan pesan "Validating location..."
Setelah face validation pass, sistem menampilkan status "Sedang validasi lokasi..." atau "Validating location..." untuk memberitahu user bahwa proses lanjut.

#### Langkah 3: Sistem meminta izin akses lokasi/GPS
Browser akan menampilkan pop-up asking for location permission. Pop-up ini muncul dari sistem operasi atau browser.

Karyawan harus klik "Allow", "Izinkan", atau "Yes" untuk memberikan akses ke GPS.

**Catatan**: Ini adalah pop-up sistem operasi (bukan browser), jadi tergantung OS (Android, iOS, Windows, etc).

Jika karyawan menolak:
- Sistem akan menampilkan error message: "GPS akses ditolak. Aktifkan lokasi di settings."
- Clock-in dihentikan
- Karyawan harus enable GPS di settings device atau browser settings

#### Langkah 4: Sistem mengaktifkan GPS dan menunggu signal
Setelah permission diberikan, sistem mengaktifkan GPS pada device karyawan.

GPS mulai mencari signal dari satelit:
- Jika GPS indoor (dalam gedung): Bisa memakan waktu 5-30 detik, atau bahkan tidak dapat signal (GPS membutuhkan line-of-sight ke langit)
- Jika GPS outdoor (di luar): Biasanya cepat, 1-5 detik

#### Langkah 5: Sistem menangkap koordinat lokasi saat ini
Setelah GPS dapat signal, sistem menangkap koordinat lokasi karyawan saat itu:
- **User Latitude**: Contoh -6.17540
- **User Longitude**: Contoh 106.82720
- **Accuracy**: Contoh ±8 meter (tingkat akurasi GPS)

Accuracy penting: GPS tidak selalu 100% akurat. Biasanya akurat 5-50 meter tergantung kondisi.

#### Langkah 6: Sistem mengambil koordinat kantor dari database
Sistem retrieve koordinat kantor yang sudah disimpan sebelumnya:
- **Office Latitude**: -6.17553
- **Office Longitude**: 106.82714
- **Threshold Radius**: 50 meter

#### Langkah 7: Sistem menghitung jarak antara user dan kantor
Sistem menghitung jarak geometris antara 2 titik GPS:
- User location: (-6.17540, 106.82720)
- Office location: (-6.17553, 106.82714)

Rumus yang digunakan: **Haversine Formula** (rumus untuk menghitung jarak antara 2 titik GPS di permukaan bumi).

Hasilnya adalah 1 angka jarak dalam **meter**.

**Analogi**: Bayangkan 2 titik di peta. Gambar garis lurus antara keduanya. Panjang garis itu adalah jarak.

Dalam kasus contoh di atas, jarak kurang lebih ~**40 meter**.

#### Langkah 8: Sistem membandingkan jarak dengan threshold
Sistem punya threshold/batasan standar: **50 meter**

Interpretasi hasil:
- **Distance ≤ 50 meter**: Karyawan berada di dalam radius kantor ✓
- **Distance > 50 meter**: Karyawan berada di luar radius kantor ✗

#### Langkah 9A: Jika BERADA DI KANTOR (Distance ≤ 50m)
- Sistem menampilkan pesan sukses: "Lokasi terverifikasi" atau "Location verified"
- Distance ditampilkan: Contoh "Distance: 40m"
- Accuracy ditampilkan: Contoh "GPS Accuracy: ±8m"
- Sistem proceed ke **Attendance Recording**
- Clock-in diterima dan disimpan ke database

#### Langkah 9B: Jika TIDAK DI KANTOR (Distance > 50m)
- Sistem menampilkan error message: "Tidak berada di lokasi kantor. Distance: [angka]m dari kantor"
- Contoh: "Not at office location. You are 352m away from office."
- Sistem menampilkan prompt: "Coba lagi?" atau "Retry?"
- Karyawan punya opsi:
  - **Retry**: Kembali ke Langkah 3 (GPS aktif lagi, ambil koordinat baru)
  - **Cancel**: Batalkan clock-in, proses dihentikan

#### Langkah 10: Retry logic (jika perlu)
Jika karyawan coba lagi:
- GPS aktif kembali, mencari signal baru
- Bisa ambil koordinat baru (mungkin sudah dekat kantor)
- Bandingkan jarak lagi
- Jika masih > 50m, user bisa retry lagi

Jika tetap gagal setelah beberapa retry:
- Tampilkan error final: "Tidak bisa verifikasi lokasi. Pastikan Anda berada di kantor. Hubungi admin jika ada masalah."
- Clock-in ditolak

---

## Faktor-Faktor yang Mempengaruhi Akurasi GPS

### Faktor yang membuat GPS AKURAT:
1. **Outdoor dengan sky view** - GPS paling akurat jika bisa melihat langit (line-of-sight ke satelit)
2. **Wilayah perkotaan** - Urban areas punya banyak satelit signal
3. **Device GPS modern** - Smartphone terbaru punya GPS yang lebih akurat
4. **Cuaca cerah** - Awan/hujan bisa affect signal
5. **Duduk diam** - Jangan bergerak saat GPS capture

### Faktor yang membuat GPS TIDAK AKURAT:
1. **Indoor/dalam gedung** - GPS tidak bisa penetrate dinding, akurat bisa >100 meter
2. **Di bawah jembatan/terowongan** - Signal terblokir
3. **Wilayah terpencil** - Satelit signal terbatas
4. **Cuaca buruk** - Hujan lebat, badai bisa interference
5. **Device GPS lama** - Accuracy bisa ±50 meter atau lebih
6. **Nearby tall buildings** - Gedung tinggi bisa reflect signal

---

## Kondisi GPS pada Lokasi Kantor

### Jika Kantor INDOOR (dalam gedung):
**MASALAH**: GPS accuracy sangat buruk indoor, bisa > 100 meter. Karyawan bisa di lobi sudah error distance > 50m.

**SOLUSI**: 
- Gunakan WiFi triangulation sebagai supplementary (geolocation API menggabung GPS + WiFi + cellular)
- Atau toleransi radius diperbesar (misal 100-200 meter) khusus indoor
- Atau setup karyawan capture GPS saat keluar gedung (teras/outdoor area)

### Jika Kantor OUTDOOR atau ada open space (teras/parkir):
**BAGUS**: GPS akan akurat 5-30 meter. Sistem ini ideal untuk kantor outdoor.

---

## Skenario Error dan Recovery

### Skenario 1: "GPS permission denied"
- **Penyebab**: Device tidak diberi permission akses GPS
- **Recovery**: Enable GPS di Settings → Location, atau enable "Location" di browser settings

### Skenario 2: "No GPS signal / Timeout"
- **Penyebab**: GPS tidak dapat signal dari satelit (indoor, cuaca buruk, terlalu lama)
- **Recovery**: Pindah ke lokasi outdoor, tunggu beberapa saat, atau tunggu cuaca lebih baik

### Skenario 3: "GPS accuracy too low" (accuracy > 50m)
- **Penyebab**: Device GPS lama atau kondisi signal jelek
- **Recovery**: Tunggu GPS lock lebih lama (misal 30 detik), atau gunakan device lain

### Skenario 4: "Distance > 50m from office"
- **Penyebab**: Karyawan belum sampai kantor, atau GPS error sangat besar
- **Recovery**: Pergi ke kantor, atau tunggu GPS lebih akurat (bisa tunggu 20-30 detik), coba lagi

### Skenario 5: "Office location not found"
- **Penyebab**: Database error, koordinat kantor belum di-setup
- **Recovery**: Contact admin untuk setup office location

### Skenario 6: "GPS signal lost during validation"
- **Penyebab**: User masuk gedung setelah capture GPS, atau GPS signal hilang tiba-tiba
- **Recovery**: Coba lagi dari lokasi dengan GPS signal bagus

---

## Role-Based Flow

### Untuk STAFF dan TEAM LEADER:
Geolocation adalah **MANDATORY** untuk setiap clock-in (setelah face recognition pass).

Alur:
1. Clock-in
2. Face recognition validation (WAJIB)
3. Jika pass → Geolocation validation (WAJIB)
4. Jika pass → Attendance recorded

### Untuk HRD MANAGER dan TECHNICAL MANAGER:
Geolocation adalah **TIDAK DIPERLUKAN**. Mereka tidak perlu geolocation check.

Alur:
1. Clock-in (langsung recorded)
2. Attendance recorded

**Alasan**: Manager punya fixed shift dan fixed office, assumed sudah ada di kantor atau jam mereka flexible.

---

## Data yang Disimpan

Setiap kali geolocation berhasil, sistem simpan:
1. **User ID**: Siapa yang melakukan clock-in
2. **Timestamp**: Kapan clock-in dilakukan
3. **User Location**: Latitude & longitude saat clock-in
4. **Distance from Office**: Jarak yang dihitung (contoh: 40 meter)
5. **GPS Accuracy**: Tingkat akurasi GPS (contoh: ±8 meter)
6. **Status**: "valid" (karena geolocation verified)

Data ini disimpan untuk:
- Audit trail (rekam jejak lokasi clock-in)
- Fraud detection (jika ada anomali, bisa di-flag)
- Analytics (statistik lokasi clock-in)
- Compliance (bukti karyawan berada di kantor)

---

## Privacy dan Security

### Data Privacy:
- Lokasi user diambil sesaat saja, tidak di-track secara real-time
- Lokasi disimpan dengan encryption di database
- Hanya saat clock-in saja lokasi di-capture, bukan tracking 24/7
- Lokasi data bisa request delete oleh user

### Security:
- HTTPS dibutuhkan (secure connection)
- GPS data tidak di-transfer ke third party
- Location validation dilakukan client-side dan server-side
- Database punya access control

---

## Timeline Proses Geolocation

```
Total waktu: 2-10 detik

├─ Request GPS permission: Instant (user click)
├─ GPS searching signal: 1-5 detik (outdoor), 10-30 detik (indoor atau signal lemah)
├─ Capture coordinates: <1ms
├─ Fetch office location: 50-200ms
├─ Calculate Haversine distance: <1ms
├─ Compare & respond: <10ms
└─ Timeout jika GPS tidak dapat signal: 10 detik
```

Total waktu tergantung kondisi GPS. Outdoor dengan signal bagus bisa selesai 2-5 detik. Indoor atau signal lemah bisa 20-30 detik atau bahkan timeout.

---

## Best Practices untuk Karyawan

1. **Outdoor Preferred**: Lakukan clock-in di area outdoor atau terbuka jika kantor indoor
2. **Jangan Buru-buru**: GPS butuh waktu lock signal, tunggu sampai GPS find signal
3. **GPS Accuracy**: Tunggu GPS accuracy bagus (lihat indicator), jangan langsung click "Send"
4. **Retry dengan Sabar**: Jika timeout atau error, tunggu 10-20 detik, coba lagi
5. **Check Settings**: Pastikan GPS enabled di device settings
6. **Morning before work**: Jangan clock-in dari rumah dulu baru pergi kantor, langsung clock-in di kantor

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| "Location permission denied" | Enable location di Settings atau browser settings |
| "GPS signal timeout" | Pindah ke area outdoor, menjauh dari dinding/gedung |
| "Distance > 50m padahal sudah di kantor" | GPS accuracy buruk, tunggu lagi 20-30 detik, coba lagi |
| "Timeout getting GPS" | Pastikan GPS enabled, ulang device, atau coba device lain |
| GPS tidak stabil | Tutup app lain yang pakai GPS, close browser tab lain, atau restart device |
| "Office location not found" | Contact admin, koordinat kantor belum di-setup di database |

---

## Metrik dan Threshold

| Metric | Value | Note |
|--------|-------|------|
| Distance Threshold | 50 meter | Radius dari kantor |
| GPS Timeout | 10 detik | Jika GPS tidak dapat signal dalam 10 detik |
| Retry Max | TBD | Maksimal berapa kali retry (tentukan by policy) |
| GPS Accuracy Ideal | ±5-10 meter | Outdoor ideal condition |
| GPS Accuracy Acceptable | ±30-50 meter | Still valid untuk validation |
| GPS Accuracy Max | > 50 meter | Might need to retry, GPS accuracy buruk |

---

## Kesimpulan

Geolocation adalah layer kedua validasi untuk attendance verification. Sistemnya:
- **Dual-check**: Setelah face recognition, tambah validasi lokasi
- **Automatic**: GPS capture otomatis, user cuma tunggu hasil
- **Flexible**: Jika error, user bisa retry, sistemnya tidak strict
- **Privacy-respecting**: Lokasi hanya capture saat clock-in, bukan tracking 24/7

Kombinasi face recognition + geolocation memastikan:
1. Orang yang benar (face)
2. Di tempat yang benar (location)

Sistem ini effective mencegah fraud dan memastikan attendance accuracy.
