/* ══════════════════════════════════════════════
   FACE-API RENDER FUNCTIONS
   Data mapping for biometric session state
══════════════════════════════════════════════ */

var BIO_STATUS_MAP = {
  valid:   { text: 'Valid',   color: '#2e7d4f' },
  late:    { text: 'Late',    color: '#b06000' },
  invalid: { text: 'Invalid', color: '#c0392b' }
};

/* Returns { text, color } for a clock-in/out status string */
function buildClockStatusInfo(status) {
  return BIO_STATUS_MAP[status] || { text: status || '-', color: '#6b7c8a' };
}

/*
 * Derives session state from today's attendance records.
 *
 * Returns one of:
 *   { state: 'idle' }
 *   { state: 'complete' }
 *   { state: 'active', timeParts: 'HH:MM', clockInDate: Date }
 */
function buildSessionState(records) {
  var session1 = null;
  for (var i = 0; i < records.length; i++) {
    if (records[i].session === 1) { session1 = records[i]; break; }
  }

  if (!session1 || !session1.check_in_time) {
    return { state: 'idle' };
  }

  if (session1.check_in_time && session1.check_out_time) {
    return { state: 'complete' };
  }

  var raw = session1.check_in_time;
  var timeParts = raw.includes(' ') ? raw.split(' ')[1].slice(0, 5) : raw.slice(0, 5);
  var clockInDate = new Date(raw.replace(' ', 'T'));

  return { state: 'active', timeParts: timeParts, clockInDate: clockInDate };
}
