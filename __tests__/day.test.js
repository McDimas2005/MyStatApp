describe('day helpers', () => {
  const originalTimeZone = process.env.TZ;

  afterEach(() => {
    jest.useRealTimers();
    process.env.TZ = originalTimeZone;
    jest.resetModules();
  });

  it('uses the device local day instead of UTC when formatting and shifting dates', () => {
    process.env.TZ = 'Asia/Jakarta';
    jest.resetModules();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-22T00:30:00+07:00'));

    const { formatDayString, isNextDay, shiftDayString } = require('../src/utils/day');

    expect(formatDayString(new Date())).toBe('2026-04-22');
    expect(shiftDayString('2026-04-22', -1)).toBe('2026-04-21');
    expect(isNextDay('2026-04-21', '2026-04-22')).toBe(true);
  });
});
