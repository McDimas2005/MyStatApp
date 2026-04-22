import {
  addMonthsLocal,
  buildCoreCompletionSet,
  getBestStreak,
  getCoreStreakSummary,
  getCurrentStreak,
  getMonthCalendar,
  getRecentDayStatuses,
  startOfMonthLocal,
} from '../src/utils/coreStreaks';

describe('core streak helpers', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-22T10:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('computes current and best streaks from completed day strings', () => {
    const daySet = new Set(['2026-04-18', '2026-04-20', '2026-04-21', '2026-04-22']);

    expect(getCurrentStreak(daySet, '2026-04-22')).toBe(3);
    expect(getBestStreak(daySet)).toBe(3);
  });

  it('builds streak summaries and recent day statuses from events', () => {
    const events = [
      { id: 'event-1', coreId: 'core-1', day: '2026-04-20' },
      { id: 'event-2', coreId: 'core-1', day: '2026-04-21' },
      { id: 'event-3', coreId: 'core-1', day: '2026-04-22' },
      { id: 'event-4', coreId: 'core-1', day: '2026-04-22' },
      { id: 'event-5', coreId: 'core-2', day: '2026-04-22' },
    ];

    const daySet = buildCoreCompletionSet(events, 'core-1');
    const summary = getCoreStreakSummary(events, 'core-1');
    const recentDays = getRecentDayStatuses(daySet, 3, '2026-04-22');

    expect([...daySet]).toEqual(['2026-04-20', '2026-04-21', '2026-04-22']);
    expect(summary.currentStreak).toBe(3);
    expect(summary.bestStreak).toBe(3);
    expect(summary.totalCompletedDays).toBe(3);
    expect(recentDays).toEqual([
      { key: '2026-04-20', label: '20', completed: true, isToday: false },
      { key: '2026-04-21', label: '21', completed: true, isToday: false },
      { key: '2026-04-22', label: '22', completed: true, isToday: true },
    ]);
  });

  it('creates a local-month calendar grid and month navigation helpers', () => {
    const visibleMonth = startOfMonthLocal(new Date('2026-04-22T10:00:00'));
    const nextMonth = addMonthsLocal(visibleMonth, 1);
    const calendar = getMonthCalendar(visibleMonth, new Set(['2026-04-01', '2026-04-22']));
    const cells = calendar.weeks.flat();
    const firstDayCell = cells.find((cell) => cell.day === '2026-04-01');
    const todayCell = cells.find((cell) => cell.day === '2026-04-22');

    expect(visibleMonth.getFullYear()).toBe(2026);
    expect(visibleMonth.getMonth()).toBe(3);
    expect(visibleMonth.getDate()).toBe(1);
    expect(nextMonth.getMonth()).toBe(4);
    expect(calendar.daysInMonth).toBe(30);
    expect(calendar.completedCount).toBe(2);
    expect(firstDayCell.completed).toBe(true);
    expect(todayCell.isToday).toBe(true);
  });
});
