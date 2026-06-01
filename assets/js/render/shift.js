/* ══════════════════════════════════════════════
   SHIFT RENDER FUNCTIONS
══════════════════════════════════════════════ */

var SHIFT_BADGE_CFG = {
  morning:   { label: 'Morning',   cls: 'morning',   time: '06:00–14:00' },
  afternoon: { label: 'Afternoon', cls: 'afternoon', time: '14:00–22:00' },
  night:     { label: 'Night',     cls: 'night',     time: '22:00–06:00' },
  dayoff:    { label: 'Day Off',   cls: 'dayoff',    time: '' }
};

function getShiftBadge(shiftName, isDayOff) {
  if (isDayOff) return SHIFT_BADGE_CFG.dayoff;
  var name = (shiftName || '').toLowerCase();
  if (name.indexOf('morning')   !== -1) return SHIFT_BADGE_CFG.morning;
  if (name.indexOf('afternoon') !== -1) return SHIFT_BADGE_CFG.afternoon;
  if (name.indexOf('night')     !== -1) return SHIFT_BADGE_CFG.night;
  return { label: shiftName || '—', cls: 'dayoff', time: '' };
}

function mapShiftRow(raw) {
  var dateStr   = raw.date || '';
  var shiftName = raw.shift_name || '';
  var isDayOff  = raw.is_day_off === 1 || raw.is_day_off === true;
  var today     = shiftTodayStr();
  return {
    id:          raw.id       || null,
    userId:      raw.user_id  || null,
    name:        raw.user_name || raw.name || '—',
    date:        dateStr,
    shiftId:     raw.shift_id || null,
    shiftType:   isDayOff ? 'Day Off' : shiftName,
    isDayOff:    isDayOff,
    teamName:    raw.team_name || '—',
    dateDisplay: formatShiftDate(dateStr),
    badge:       getShiftBadge(shiftName, isDayOff),
    isPast:      dateStr ? dateStr < today : false
  };
}

function buildShiftTableRows(rawList) {
  return (rawList || []).map(mapShiftRow);
}

function formatShiftDate(dateStr) {
  if (!dateStr) return '—';
  var p = dateStr.split('-');
  if (p.length < 3) return dateStr;
  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return parseInt(p[2]) + ' ' + MONTHS[parseInt(p[1]) - 1] + ' ' + p[0];
}

function shiftTodayStr() {
  var d = new Date();
  var pad = function(n) { return n < 10 ? '0' + n : '' + n; };
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
