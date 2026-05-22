/* ══════════════════════════════════════════════
   OFFICE RENDER / LOCATION HELPERS
══════════════════════════════════════════════ */

/* Haversine formula — returns distance in meters between two coordinates */
function haversineDistance(lat1, lng1, lat2, lng2) {
  var R    = 6371000;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLng = (lng2 - lng1) * Math.PI / 180;
  var a    = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
             Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
             Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/*
 * Finds the nearest office and checks if user is within its radius.
 *
 * Returns:
 *   { office, distance: number (meters, rounded), valid: bool }
 *   { office: null, distance: null, valid: false }  — when GPS or offices missing
 */
function findNearestOffice(offices, userLat, userLng) {
  if (!offices || offices.length === 0 || userLat === null || userLng === null) {
    return { office: null, distance: null, valid: false };
  }

  var nearest = null;
  var minDist = Infinity;

  offices.forEach(function(office) {
    var dist = haversineDistance(
      parseFloat(userLat),  parseFloat(userLng),
      parseFloat(office.latitude), parseFloat(office.longitude)
    );
    if (dist < minDist) { minDist = dist; nearest = office; }
  });

  var threshold = nearest.radius_meters || 50;

  return {
    office:   nearest,
    distance: Math.round(minDist),
    valid:    minDist <= threshold
  };
}
