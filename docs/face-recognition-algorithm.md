# Face Recognition Algorithm

## Overview

Sistem face recognition menggunakan **face-api.js** library dengan **Euclidean Distance** untuk membandingkan embedding wajah yang tersimpan dengan wajah yang di-capture saat clock-in.

**Threshold:** Euclidean distance < 0.5

## Flow Diagram

```
User Clock-In
    ↓
Load stored face embedding from DB
    ↓
Capture face from camera/webcam
    ↓
Detect face with face-api.js
    ↓
Extract face descriptor (embedding vector)
    ↓
Calculate Euclidean Distance
    ↓
Distance < 0.5?
  ├─ YES → Face Valid ✓
  └─ NO → Face Invalid ✗ (Retry or Abort)
```

## Algorithm Details

### 1. Face Embedding Storage (Registration Phase)

Saat user register/enroll:

```javascript
async function enrollUserFace(userId, imageFile) {
  // Load face-api models
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
  
  // Detect face dan extract descriptor
  var img = await faceapi.bufferToImage(imageFile);
  var detection = await faceapi.detectSingleFace(img)
    .withFaceDescriptors();
  
  if (!detection) {
    throw new Error('No face detected in image');
  }
  
  // descriptor adalah array 128 dimensi
  var faceEmbedding = detection.descriptor;
  
  // Simpan ke database
  await saveFaceEmbedding(userId, Array.from(faceEmbedding));
  
  return { success: true, userId: userId };
}
```

### 2. Face Recognition (Clock-In Phase)

Saat user melakukan clock-in:

```javascript
async function validateFaceRecognition(userId) {
  try {
    // Step 1: Fetch stored face embedding from database
    var storedEmbedding = await fetchUserFaceEmbedding(userId);
    
    if (!storedEmbedding) {
      return { 
        success: false, 
        error: 'User tidak memiliki data face recognition' 
      };
    }
    
    // Step 2: Request access to camera (browser permission)
    var stream = await navigator.mediaDevices.getUserMedia({ 
      video: { width: 320, height: 240 } 
    });
    
    // Step 3: Capture image from video stream
    var video = document.querySelector('video');
    video.srcObject = stream;
    
    // Wait for video to load
    await new Promise(resolve => {
      video.onloadedmetadata = () => resolve();
    });
    
    // Capture frame as image
    var canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    // Stop camera stream
    stream.getTracks().forEach(track => track.stop());
    
    // Step 4: Convert canvas to image for face-api
    var capturedImage = await faceapi.canvasToBlob(canvas);
    var img = await faceapi.bufferToImage(capturedImage);
    
    // Step 5: Detect face in captured image
    var detection = await faceapi.detectSingleFace(img)
      .withFaceDescriptors();
    
    if (!detection) {
      return { 
        success: false, 
        error: 'Wajah tidak terdeteksi. Coba lagi.' 
      };
    }
    
    // Step 6: Extract descriptor (embedding) dari detected face
    var capturedEmbedding = detection.descriptor;
    
    // Step 7: Calculate Euclidean Distance
    var distance = euclideanDistance(
      storedEmbedding, 
      Array.from(capturedEmbedding)
    );
    
    console.log('Face Distance:', distance);
    
    // Step 8: Compare distance with threshold (0.5)
    var THRESHOLD = 0.5;
    
    if (distance < THRESHOLD) {
      return { 
        success: true, 
        distance: distance,
        confidence: ((1 - (distance / THRESHOLD)) * 100).toFixed(2) + '%'
      };
    } else {
      return { 
        success: false, 
        error: `Wajah tidak cocok (distance: ${distance.toFixed(3)})`,
        distance: distance
      };
    }
    
  } catch (error) {
    return { 
      success: false, 
      error: 'Error validasi wajah: ' + error.message 
    };
  }
}
```

### 3. Euclidean Distance Calculation

Mathematical formula untuk menghitung similarity antara 2 embedding vectors:

```
Distance = √(Σ(v1[i] - v2[i])²) untuk i = 0 hingga 127
```

Implementasi:

```javascript
function euclideanDistance(vec1, vec2) {
  // vec1 & vec2 adalah array 128 dimensi
  
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have same length');
  }
  
  var sumOfSquares = 0;
  
  for (var i = 0; i < vec1.length; i++) {
    var diff = vec1[i] - vec2[i];
    sumOfSquares += diff * diff;
  }
  
  return Math.sqrt(sumOfSquares);
}
```

**Interpretasi hasil:**
- Distance 0.0 - 0.3: Very high confidence match
- Distance 0.3 - 0.5: Valid match (above threshold)
- Distance > 0.5: No match / Different person

### 4. Main Clock-In Handler

```javascript
async function handleClockIn(userId, userRole) {
  // Hanya untuk staff & team_leader butuh face + geo
  if (userRole !== 'staff' && userRole !== 'team_leader') {
    // Manager langsung clock-in, skip face recognition
    return await simpleClockIn(userId);
  }
  
  // For staff & team leaders
  console.log('Starting face recognition...');
  
  var faceResult = await validateFaceRecognition(userId);
  
  if (!faceResult.success) {
    // Show error message to user
    showUserError(faceResult.error);
    
    // Prompt user untuk retry
    var shouldRetry = confirm(faceResult.error + '\n\nCoba lagi?');
    if (shouldRetry) {
      return await handleClockIn(userId, userRole);
    } else {
      return false; // Abort clock-in
    }
  }
  
  // Face validation passed
  console.log('Face recognized with confidence:', faceResult.confidence);
  
  // Proceed to geolocation validation (handled in separate flow)
  return true;
}
```

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| No face detected | User tidak facing kamera | Align wajah ke kamera |
| Distance > 0.5 | Wajah tidak cocok | Pastikan user yang benar |
| Camera access denied | Browser permission denied | Allowed camera akses di browser settings |
| Model not loaded | face-api models failed to load | Check model files in `/models` directory |

## Performance Notes

- Face detection: ~100-500ms per image (tergantung CPU)
- Embedding calculation: ~50-100ms
- Total time per validation: ~200-600ms
- Model size: ~350KB (tinyFaceDetector)

## Database Schema

```sql
CREATE TABLE user_face_embeddings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  embedding JSON NOT NULL, -- Array 128 dimensi
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Face-API.js Models Required

Download dari: https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/

- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-shard1`
- `face_landmark_68_model-weights_manifest.json`
- `face_landmark_68_model-shard1`
- `face_descriptor_model-weights_manifest.json`
- `face_descriptor_model-shard1`

## Security Considerations

1. **Face Embedding Privacy**: Simpan hanya embedding, bukan image
2. **HTTPS Required**: Face capture membutuhkan secure context
3. **Rate Limiting**: Limit retry attempts untuk prevent brute force
4. **Liveness Detection** (Future): Tambahkan liveness check untuk prevent spoofing

## Testing

```javascript
// Unit test untuk euclidean distance
function testEuclideanDistance() {
  var vec1 = [0, 0, 0];
  var vec2 = [3, 4, 0];
  var distance = euclideanDistance(vec1, vec2);
  console.assert(distance === 5, 'Distance should be 5');
}

// Integration test untuk full flow
async function testFaceRecognition() {
  var result = await validateFaceRecognition(1);
  console.log('Face validation result:', result);
  console.assert(result.success === true, 'Should pass validation');
}
```
