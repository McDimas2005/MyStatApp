import { formatNumber, formatPercent } from '../src/utils/numberFormat';

describe('number formatting', () => {
  it('supports compact and exact number rendering', () => {
    expect(formatNumber(1250)).toBe('1.3K');
    expect(formatNumber(1250, { compact: false })).toBe('1,250');
    expect(formatNumber(12.345, { compact: false, maximumFractionDigits: 2 })).toBe('12.35');
  });

  it('formats percentages and guards invalid input', () => {
    expect(formatPercent(87.456)).toBe('87.5%');
    expect(formatNumber(Number.NaN)).toBe('0');
    expect(formatPercent(Number.NaN)).toBe('0%');
  });
});
