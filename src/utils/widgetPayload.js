import { formatNumber } from './numberFormat';

const MAX_WIDGET_CORES = 6;

export function buildWidgetPayload({ cores, averageScoreTarget, compactNumbers }) {
  const safeCores = Array.isArray(cores) ? cores : [];
  const displayCores = selectDisplayCores(safeCores);
  const totalScore = safeCores.reduce((sum, core) => sum + Number(core.totalScore || 0), 0);
  const averageScore = safeCores.length ? totalScore / safeCores.length : 0;

  return {
    schemaVersion: 1,
    totalScore,
    averageScore,
    averageScoreTarget: Number(averageScoreTarget) || 0,
    totalScoreLabel: formatNumber(totalScore, { compact: compactNumbers }),
    averageScoreLabel: formatNumber(averageScore, { compact: compactNumbers }),
    targetLabel: formatNumber(averageScoreTarget || 0, { compact: compactNumbers }),
    coreCount: safeCores.length,
    compactNumbers: Boolean(compactNumbers),
    cores: displayCores.map((core) => ({
      id: core.id,
      name: core.name,
      label: shortenCoreLabel(core.name),
      color: core.color || '#0b3d91',
      totalScore: Number(core.totalScore || 0),
    })),
  };
}

function selectDisplayCores(cores) {
  if (cores.length <= MAX_WIDGET_CORES) {
    return cores;
  }

  return [...cores]
    .sort((left, right) => Number(right.totalScore || 0) - Number(left.totalScore || 0))
    .slice(0, MAX_WIDGET_CORES);
}

function shortenCoreLabel(name = '') {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 'CORE';
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.map((word) => word[0]).join('').slice(0, 3).toUpperCase();
}
