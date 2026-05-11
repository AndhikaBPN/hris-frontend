# Face Recognition - Flowchart Lengkap

```mermaid
flowchart TD
    A([User Clock-In]) --> B{User Role?}
    
    B -->|Manager| Z1[Clock-In Langsung<br/>Tanpa Validasi]
    Z1 --> Z2([Attendance Recorded])
    
    B -->|Staff/Team Leader| C[Request Camera<br/>Permission]
    C --> D{Permission<br/>Granted?}
    
    D -->|No| E["❌ Camera Access Denied<br/>Enable di settings"]
    E --> F1([Clock-In Dibatalkan])
    
    D -->|Yes| G[Kamera Aktif<br/>Live Preview]
    G --> H[User Position Wajah<br/>di Tengah Layar]
    H --> I[Tunggu 2-3 Detik<br/>Sistem Siap Capture]
    
    I --> J["📸 Sistem Capture Image<br/>dari Video Stream"]
    J --> K["🔍 Deteksi Wajah<br/>di dalam Image"]
    
    K --> L{Wajah<br/>Terdeteksi?}
    
    L -->|No atau Multiple| M["❌ Wajah Tidak Valid<br/>Retry atau Cancel"]
    M --> M1{Retry?}
    M1 -->|Yes| G
    M1 -->|No| F1
    
    L -->|1 Wajah| N["📊 Extract Embedding<br/>dari Detected Face"]
    N --> O["🗄️ Ambil Stored Embedding<br/>dari Database"]
    
    O --> P["📏 Hitung Euclidean Distance<br/>antara 2 Embedding"]
    P --> Q["⚖️ Bandingkan dengan<br/>Threshold 0.5"]
    
    Q --> R{Distance<br/>< 0.5?}
    
    R -->|No| S["❌ Wajah Tidak Cocok<br/>Distance >= 0.5"]
    S --> S1{Retry?}
    S1 -->|Yes| G
    S1 -->|No| F1
    
    R -->|Yes| T["✓ Wajah Cocok!<br/>Face Validation Pass"]
    T --> U["→ Lanjut ke<br/>Geolocation Validation"]
    U --> V["[Proses Geolocation...]"]
    
    V --> W{Geolocation<br/>Valid?}
    
    W -->|Yes| X["✓ Attendance Recorded<br/>Status: VALID"]
    X --> X1([Clock-In Sukses])
    
    W -->|No| Y["❌ Geolocation Failed<br/>Clock-In Dibatalkan"]
    Y --> F1
    
    style A fill:#90EE90
    style X1 fill:#90EE90
    style Z2 fill:#90EE90
    style F1 fill:#FFB6C6
    style T fill:#FFD700
    style E fill:#FFB6C6
    style S fill:#FFB6C6
    style M fill:#FFB6C6
```

## Penjelasan Flow:

1. **Start**: User membuka halaman clock-in
2. **Role Check**: Tentukan apakah staff/team leader atau manager
3. **Camera Permission**: Request akses camera ke browser
4. **Capture**: Ambil snapshot wajah dari video stream
5. **Detect**: Cari dan validasi ada 1 wajah di image
6. **Extract**: Konversi wajah menjadi embedding (128 angka)
7. **Compare**: Hitung jarak dengan embedding yang tersimpan
8. **Validate**: Cek apakah distance < 0.5
9. **Pass/Fail**: Jika pass → geolocation, jika fail → retry atau abort
10. **Geolocation**: Proses validasi lokasi (file terpisah)
11. **Result**: Attendance recorded atau clock-in dibatalkan
