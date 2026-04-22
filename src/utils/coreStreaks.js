import {
  addMonths,
  formatDayString,
  getDaysInMonth,
  shiftDayString,
  startOfMonth,
} from './day';

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function todayDayString() {
  return formatDayString(new Date());
}

export function startOfMonthLocal(baseDate = new Date()) {
  return startOfMonth(baseDate);
}

export function addMonthsLocal(monthDate, delta) {
  return addMonths(monthDate, delta);
}

export function formatMonthLabel(monthDate) {
  return monthDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
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
  let cursorDay = referenceDay;

  while (daySet.has(cursorDay)) {
    streak += 1;
    cursorDay = shiftDayString(cursorDay, -1);
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
      running = shiftDayString(previous, 1) === day ? running + 1 : 1;
    }

    best = Math.max(best, running);
    previous = day;
  });

  return best;
}

export function getRecentDayStatuses(daySet, count = 7, referenceDay = todayDayString()) {
  return Array.from({ length: count }, (_, index) => {
    const daysAgo = count - 1 - index;
    const day = shiftDayString(referenceDay, -daysAgo);

    return {
      key: day,
      label: day.slice(8, 10),
      completed: daySet.has(day),
      isToday: daysAgo === 0,
    };
  });
}

export function getMonthCalendar(monthDate, daySet) {
  const year = monthDate.getFullYear();
  const monthIndex = monthDate.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const firstWeekday = firstDay.getDay();
  const daysInMonth = getDaysInMonth(monthDate);
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
    const day = formatDayString(new Date(year, monthIndex, dayOfMonth));
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
