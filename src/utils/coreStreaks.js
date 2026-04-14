const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function padMonthDay(value) {
  return String(value).padStart(2, '0');
}

export function todayDayString() {
  return new Date().toISOString().slice(0, 10);
}

export function startOfMonthUtc(baseDate = new Date()) {
  return new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), 1));
}

export function addMonthsUtc(monthDate, delta) {
  return new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + delta, 1));
}

export function formatMonthLabel(monthDate) {
  return monthDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function buildCoreCompletionSet(events, coreId) {
  return new Set(
    events
      .filter((event) => event.coreId === coreId)
      .map((event) => event.day),
  );
}

export function getCurrentStreak(daySet, referenceDay = todayDayString()) {
  let streak = 0;
  let cursor = new Date(`${referenceDay}T00:00:00Z`);

  while (daySet.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }

  return streak;
}

export function getBestStreak(daySet) {
  const sortedDays = [...daySet].sort();
  let best = 0;
  let running = 0;
  let previous = null;

  sortedDays.forEach((day) => {
    if (!previous) {
      running = 1;
    } else {
      const prevDate = new Date(`${previous}T00:00:00Z`);
      const currDate = new Date(`${day}T00:00:00Z`);
      running = (currDate - prevDate) / DAY_MS === 1 ? running + 1 : 1;
    }

    best = Math.max(best, running);
    previous = day;
  });

  return best;
}

export function getRecentDayStatuses(daySet, count = 7) {
  return Array.from({ length: count }, (_, index) => {
    const daysAgo = count - 1 - index;
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - daysAgo);
    const day = date.toISOString().slice(0, 10);

    return {
      key: day,
      label: day.slice(8, 10),
      completed: daySet.has(day),
      isToday: daysAgo === 0,
    };
  });
}

function buildMonthDay(year, monthIndex, dayOfMonth) {
  return `${year}-${padMonthDay(monthIndex + 1)}-${padMonthDay(dayOfMonth)}`;
}

export function getMonthCalendar(monthDate, daySet) {
  const year = monthDate.getUTCFullYear();
  const monthIndex = monthDate.getUTCMonth();
  const firstDay = new Date(Date.UTC(year, monthIndex, 1));
  const firstWeekday = firstDay.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const today = todayDayString();
  const cells = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push({
      key: `empty-start-${index}`,
      label: '',
      day: null,
      inMonth: false,
      completed: false,
      isToday: false,
    });
  }

  for (let dayOfMonth = 1; dayOfMonth <= daysInMonth; dayOfMonth += 1) {
    const day = buildMonthDay(year, monthIndex, dayOfMonth);
    cells.push({
      key: day,
      label: String(dayOfMonth),
      day,
      inMonth: true,
      completed: daySet.has(day),
      isToday: today === day,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      key: `empty-end-${cells.length}`,
      label: '',
      day: null,
      inMonth: false,
      completed: false,
      isToday: false,
    });
  }

  const weeks = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }

  const completedCount = cells.filter((cell) => cell.completed).length;

  return {
    weekdayLabels: WEEKDAY_LABELS,
    weeks,
    completedCount,
    daysInMonth,
  };
}

export function getCoreStreakSummary(events, coreId) {
  const daySet = buildCoreCompletionSet(events, coreId);
  return {
    daySet,
    currentStreak: getCurrentStreak(daySet),
    bestStreak: getBestStreak(daySet),
    recentDays: getRecentDayStatuses(daySet),
    totalCompletedDays: daySet.size,
  };
}
