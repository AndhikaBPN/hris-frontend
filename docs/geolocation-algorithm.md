# Geolocation Algorithm

## Overview

Sistem geolocation menggunakan **Geolocation API** (browser) dan **Haversine formula** untuk menghitung jarak antara user location dan office location.

**Threshold:** Distance < 50 meters

## Flow Diagram

```
Face Recognition Valid ✓
    ↓
Request GPS permission
    ↓
Get current user location (lat, lng)
    ↓
Fetch office location from DB
    ↓
Calculate distance using Haversine formula
    ↓
Distance < 50m?
  ├─ YES → Location Valid ✓
  └─ NO → Location Invalid ✗ (Retry or Abort)
```

## Algorithm Details

### 1. Get Office Location

Fetch dari database (1 fixed coordinate per office):

```javascript
async function fetchOfficeLocation() {
  try {
    var result = await apiRequest('/api/office/location');
    
    if (!result.success) {
      throw new Error('Failed to fetch office location');
    }
    
    return {
      latitude: result.data.latitude,      // e.g., -6.1753
      longitude: result.data.longitude,    // e.g., 106.8271
      name: result.data.name,              // e.g., "Gaming House HQ"
      radius: 50                           // meters
    };
  } catch (error) {
    throw new Error('Error fetching office location: ' + error.message);
  }
}
```

### 2. Get User Current Location

Browser Geolocation API:

```javascript
function getUserLocation(options = {}) {
  return new Promise((resolve, reject) => {
    // Default options
    var geolocationOptions = {
      enableHighAccuracy: true,      // Use GPS + WiFi + cellular
      timeout: 10000,                // 10 seconds timeout
      maximumAge: 0                  // Don't use cached position
    };
    
    // Merge with user options
    Object.assign(geolocationOptions, options);
    
    navigator.geolocation.getCurrentPosition(
      // Success callback
      function(position) {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,  // Accuracy radius in meters
          altitude: position.coords.altitude,
          timestamp: position.timestamp
        });
      },
      
      // Error callback
      function(error) {
        var errorMessage = '';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'GPS akses ditolak. Aktifkan lokasi di browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Lokasi tidak tersedia. Cek koneksi GPS.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Timeout: GPS signal tidak diterima dalam 10 detik.';
            break;
          default:
            errorMessage = 'Error mengambil lokasi: ' + error.message;
        }
        reject(new Error(errorMessage));
      },
      
      // Options
      geolocationOptions
    );
  });
}
```

### 3. Haversine Distance Calculation

Mathematical formula untuk menghitung great-circle distance antara 2 GPS coordinates:

```
Δσ = 2 * arctan2(√a, √(1-a))
Distance = R * Δσ

where:
  a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlng/2)
  R = Earth radius (~6371 km = 6,371,000 m)
  Δlat = lat2 - lat1 (in radians)
  Δlng = lng2 - lng1 (in radians)
```

Implementasi:

```javascript
function haversineDistance(lat1, lng1, lat2, lng2) {
  // Earth radius in meters
  var EARTH_RADIUS = 6371000;
  
  // Convert degrees to radians
  var phi1 = (lat1 * Math.PI) / 180;
  var phi2 = (lat2 * Math.PI) / 180;
  var deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  var deltaLng = ((lng2 - lng1) * Math.PI) / 180;
  
  // Haversine formula
  var a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
          Math.cos(phi1) * Math.cos(phi2) *
          Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  // Distance in meters
  var distance = EARTH_RADIUS * c;
  
  return distance;
}
```

**Example:**
```
lat1: -6.1753, lng1: 106.8271 (Office)
lat2: -6.1750, lng2: 106.8275 (User)

distance = 352.3 meters
```

### 4. Geolocation Validation

Main validation function:

```javascript
async function validateGeolocation(userId) {
  try {
    // Step 1: Fetch office location from database
    console.log('Fetching office location...');
    var officeLocation = await fetchOfficeLocation();
    
    // Step 2: Get user current GPS location
    console.log('Requesting GPS location...');
    var userLocation = await getUserLocation({
      enableHighAccuracy: true,
      timeout: 15000
    });
    
    console.log('User location:', userLocation);
    console.log('Office location:', officeLocation);
    
    // Step 3: Calculate distance using Haversine formula
    var distance = haversineDistance(
      userLocation.latitude,
      userLocation.longitude,
      officeLocation.latitude,
      officeLocation.longitude
    );
    
    console.log('Calculated distance:', distance.toFixed(2), 'meters');
    
    // Step 4: Compare with threshold (50 meters)
    var THRESHOLD = 50; // meters
    
    if (distance <= THRESHOLD) {
      return {
        success: true,
        distance: distance.toFixed(2),
        accuracy: userLocation.accuracy.toFixed(2),
        officeLocation: officeLocation,
        userLocation: userLocation
      };
    } else {
      var distanceFromThreshold = (distance - THRESHOLD).toFixed(2);
      return {
        success: false,
        error: `Tidak di lokasi kantor (${distance.toFixed(2)}m dari kantor)`,
        distance: distance.toFixed(2),
        accuracy: userLocation.accuracy.toFixed(2),
        officeLocation: officeLocation,
        userLocation: userLocation
      };
    }
    
  } catch (error) {
    return {
      success: false,
      error: 'Error validasi lokasi: ' + error.message
    };
  }
}
```

### 5. Main Clock-In Handler (After Face Recognition)

```javascript
async function handleGeolocationValidation(userId, userRole) {
  // Hanya untuk staff & team_leader
  if (userRole !== 'staff' && userRole !== 'team_leader') {
    return true; // Manager skip geolocation
  }
  
  console.log('Starting geolocation validation...');
  
  var geoResult = await validateGeolocation(userId);
  
  if (!geoResult.success) {
    // Show detailed error to user
    showUserError(geoResult.error);
    
    console.log('Geolocation Debug:', {
      distance: geoResult.distance,
      accuracy: geoResult.accuracy,
      userLoc: geoResult.userLocation,
      officeLoc: geoResult.officeLocation
    });
    
    // Prompt retry
    var shouldRetry = confirm(geoResult.error + '\n\nCoba lagi?');
    if (shouldRetry) {
      return await handleGeolocationValidation(userId, userRole);
    } else {
      return false; // Abort clock-in
    }
  }
  
  // Geolocation validation passed
  console.log('Location verified:', geoResult.distance + 'm from office');
  
  return true; // Proceed to save attendance
}
```

### 6. Full Clock-In Flow Integration

```javascript
async function completeClockIn(userId, userRole) {
  try {
    // Step 1: Face Recognition Validation
    console.log('Step 1: Face Recognition...');
    var faceResult = await validateFaceRecognition(userId);
    
    if (!faceResult.success) {
      showUserError(faceResult.error);
      return false;
    }
    
    // Step 2: Geolocation Validation
    console.log('Step 2: Geolocation...');
    var geoResult = await validateGeolocation(userId);
    
    if (!geoResult.success) {
      showUserError(geoResult.error);
      return false;
    }
    
    // Step 3: Record attendance
    console.log('Step 3: Recording attendance...');
    var attendance = {
      user_id: userId,
      timestamp: new Date().toISOString(),
      status: 'valid',
      face_distance: faceResult.distance,
      geo_distance: geoResult.distance,
      geo_accuracy: geoResult.accuracy,
      user_location: {
        latitude: geoResult.userLocation.latitude,
        longitude: geoResult.userLocation.longitude
      }
    };
    
    var saveResult = await recordAttendance(attendance);
    
    if (!saveResult.success) {
      showUserError('Gagal menyimpan absen: ' + saveResult.error);
      return false;
    }
    
    showUserSuccess('Absen berhasil! Distance: ' + geoResult.distance + 'm');
    return true;
    
  } catch (error) {
    showUserError('Error: ' + error.message);
    return false;
  }
}
```

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| GPS akses ditolak | Browser permission denied | Enable location in browser settings |
| Lokasi tidak tersedia | No GPS signal / Weak signal | Move outside / Wait for signal |
| Timeout | GPS signal delay | Check GPS strength, retry |
| Distance > 50m | User not at office | Go to office location |
| Accuracy > 50m | GPS accuracy too low | Move to clearer area |
| Office location not found | Database error | Contact admin |

## Accuracy Considerations

GPS accuracy varies:
- **Ideal (outdoor, clear sky):** 5-10 meters
- **Normal (urban area):** 10-30 meters
- **Challenging (indoors, buildings):** 30-100+ meters

**Recommendation:** 
- Set threshold to 50m to accommodate typical urban GPS accuracy
- Log GPS accuracy alongside distance for debugging
- Consider WiFi triangulation for indoor office (Geolocation API combines GPS + WiFi + cellular)

## Database Schema

```sql
CREATE TABLE office_locations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  radius INT DEFAULT 50,  -- meters
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Example insert
INSERT INTO office_locations (name, latitude, longitude, radius)
VALUES ('Gaming House HQ', -6.17553, 106.82714, 50);
```

## Security Considerations

1. **HTTPS Required**: Geolocation API requires secure context (HTTPS)
2. **User Privacy**: Only collect location during clock-in, don't track continuously
3. **Location Spoofing**: GPS can be spoofed (mitigated by face recognition + combination)
4. **Data Retention**: Delete location data after 30 days (compliance)

## Performance Notes

- Geolocation request: 1-5 seconds (depends on GPS signal)
- Haversine calculation: < 1ms
- Total validation time: 1-5 seconds

## Testing

```javascript
// Unit test untuk Haversine distance
function testHaversineDistance() {
  // Same coordinates
  var dist1 = haversineDistance(-6.1753, 106.8271, -6.1753, 106.8271);
  console.assert(dist1 < 1, 'Same coordinates should be ~0 meters');
  
  // ~352 meters apart
  var dist2 = haversineDistance(-6.1753, 106.8271, -6.1750, 106.8275);
  console.log('Distance: ' + dist2.toFixed(2) + ' meters');
  console.assert(dist2 > 300 && dist2 < 400, 'Distance should be ~352m');
}

// Integration test
async function testGeolocation() {
  var result = await validateGeolocation(1);
  console.log('Geolocation result:', result);
}
```

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✓ | HTTPS required |
| Firefox | ✓ | HTTPS required |
| Safari | ✓ | HTTPS required (iOS 13+) |
| Edge | ✓ | HTTPS required |
| IE 11 | ✗ | Not supported |

## API Response Format

```json
{
  "success": true,
  "distance": "45.32",
  "accuracy": "8.50",
  "officeLocation": {
    "latitude": -6.17553,
    "longitude": 106.82714,
    "name": "Gaming House HQ",
    "radius": 50
  },
  "userLocation": {
    "latitude": -6.17550,
    "longitude": 106.82718,
    "accuracy": 8.50,
    "timestamp": 1715407200000
  }
}
```
