export function formatNumber(value, options = {}) {
  const {
    compact = true,
    maximumFractionDigits = 1,
  } = options;

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return '0';
  }

  const normalized = Math.abs(numeric) >= 1000 ? numeric : roundToMaxFraction(numeric, maximumFractionDigits);

  if (!compact) {
    return trimTrailingZero(
      normalized.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits,
      }),
    );
  }

  const abs = Math.abs(normalized);
  const suffixes = [
    { value: 1_000_000_000, suffix: 'B' },
    { value: 1_000_000, suffix: 'M' },
    { value: 1_000, suffix: 'K' },
  ];

  for (const unit of suffixes) {
    if (abs >= unit.value) {
      const scaled = normalized / unit.value;
      return `${trimTrailingZero(
        scaled.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits,
        }),
      )}${unit.suffix}`;
    }
  }

  return trimTrailingZero(
    normalized.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits,
    }),
  );
}

export function formatPercent(value, options = {}) {
  const { maximumFractionDigits = 1 } = options;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return '0%';
  }

  return `${trimTrailingZero(
    numeric.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits,
    }),
  )}%`;
}

function roundToMaxFraction(value, maximumFractionDigits) {
  const factor = 10 ** maximumFractionDigits;
  return Math.round(value * factor) / factor;
}

function trimTrailingZero(value) {
  return value.replace(/(\.\d*?[1-9])0+$|\.0+$/u, '$1');
}
