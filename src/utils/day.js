function padDayPart(value) {
  return String(value).padStart(2, '0');
}

export function formatDayString(date = new Date()) {
  return [
    date.getFullYear(),
    padDayPart(date.getMonth() + 1),
    padDayPart(date.getDate()),
  ].join('-');
}

export function parseDayString(day) {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date);
}

export function shiftDayString(day, deltaDays) {
  const shifted = parseDayString(day);
  shifted.setDate(shifted.getDate() + deltaDays);
  return formatDayString(shifted);
}

export function isNextDay(previousDay, currentDay) {
  if (!previousDay || !currentDay) return false;
  return shiftDayString(previousDay, 1) === currentDay;
}

export function startOfMonth(baseDate = new Date()) {
  return new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
}

export function addMonths(monthDate, delta) {
  return new Date(monthDate.getFullYear(), monthDate.getMonth() + delta, 1);
}

export function getDaysInMonth(monthDate) {
  return new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
}
