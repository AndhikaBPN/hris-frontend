var locationHistory = [];
var officeLocationCache = null;
var LOCATION_SMOOTHING_WINDOW = 5;


function getHighAccuracyGeolocation() {
  return new Promise(function(resolve) {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function(pos) {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          source: 'device_gps'
        });
      },
      function() {
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

function smoothLocation(newLocation) {
  if (!newLocation) return null;

  locationHistory.push(newLocation);
  if (locationHistory.length > LOCATION_SMOOTHING_WINDOW) {
    locationHistory.shift();
  }

  var avgLat = locationHistory.reduce((sum, loc) => sum + loc.lat, 0) / locationHistory.length;
  var avgLng = locationHistory.reduce((sum, loc) => sum + loc.lng, 0) / locationHistory.length;
  var avgAccuracy = locationHistory.reduce((sum, loc) => sum + loc.accuracy, 0) / locationHistory.length;

  return {
    lat: avgLat,
    lng: avgLng,
    accuracy: avgAccuracy,
    samples: locationHistory.length,
    source: 'smoothed_' + newLocation.source
  };
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  var R = 6371000;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLng = (lng2 - lng1) * Math.PI / 180;

  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);

  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function getAccurateLocation() {
  var location = await getHighAccuracyGeolocation();

  if (!location) {
    return {
      success: false,
      lat: null,
      lng: null,
      accuracy: null,
      error: 'Unable to determine location. Enable GPS and try again.'
    };
  }

  var smoothed = smoothLocation(location);

  return {
    success: true,
    lat: smoothed.lat,
    lng: smoothed.lng,
    accuracy: smoothed.accuracy,
    samples: smoothed.samples,
    source: smoothed.source,
    error: null
  };
}

async function getOfficeLocationFromCache() {
  if (officeLocationCache) {
    return officeLocationCache;
  }

  var result = await fetchOfficeLocations();
  if (result.success && result.data && result.data.length > 0) {
    var office = result.data[0];
    officeLocationCache = {
      id: office.id,
      lat: parseFloat(office.latitude),
      lng: parseFloat(office.longitude),
      name: office.name,
      radiusMeters: office.radius_meters
    };
    return officeLocationCache;
  }

  return null;
}

async function isWithinOfficeRadius(lat, lng, customThreshold) {
  var office = await getOfficeLocationFromCache();

  if (!office) {
    return {
      success: false,
      distance: null,
      isWithin: false,
      error: 'Could not retrieve office location'
    };
  }

  var threshold = customThreshold || office.radiusMeters;
  var distance = calculateDistance(lat, lng, office.lat, office.lng);

  return {
    success: true,
    distance: Math.round(distance),
    isWithin: distance <= threshold,
    threshold: threshold,
    officeName: office.name,
    error: null
  };
}

function resetLocationHistory() {
  locationHistory = [];
  officeLocationCache = null;
}
