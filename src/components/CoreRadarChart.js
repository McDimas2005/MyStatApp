import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import { formatNumber } from '../utils/numberFormat';

const RADAR_GRID_LEVELS = 4;
const RADAR_COLORS = {
  panel: '#f8fbff',
  border: '#dbe7fb',
  grid: '#c8d6f0',
  axis: '#9fb6dc',
  stroke: '#0b3d91',
  fill: 'rgba(11, 61, 145, 0.14)',
  point: '#0b3d91',
  label: '#52637a',
  center: '#0b3d91',
};

function shortenCoreLabel(name) {
  const words = name.split(' ').filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.map((word) => word[0]).join('').slice(0, 3).toUpperCase();
}

function buildRadarPoints(cores, radius, centerX, centerY, scale) {
  return cores
    .map((core, index) => {
      const angle = (-Math.PI / 2) + (index * Math.PI * 2) / cores.length;
      const valueRadius = radius * scale(core);
      const x = centerX + Math.cos(angle) * valueRadius;
      const y = centerY + Math.sin(angle) * valueRadius;
      return `${x},${y}`;
    })
    .join(' ');
}

export default function CoreRadarChart({
  cores,
  averageScoreTarget,
  compactNumbers,
  title = 'Hero Attribute Radar',
  subtitle,
  style,
  onPressCore,
  showLegend = true,
  enablePointTooltip = false,
}) {
  const { width: windowWidth } = useWindowDimensions();
  const targetValue = averageScoreTarget > 0 ? averageScoreTarget : 1;
  const hasEnoughCores = cores.length >= 3;
  const hasValidTarget = averageScoreTarget > 0;
  const hasCoresOverTarget = cores.some((core) => (core.totalScore || 0) > targetValue);
  const [selectedCoreId, setSelectedCoreId] = useState(null);

  const chart = useMemo(() => {
    const chartSize = Math.max(220, Math.min(windowWidth - 96, 280));
    const center = chartSize / 2;
    const radius = chartSize * 0.3;
    const labelRadius = radius + 28;
    const scale = (core) => Math.min((core.totalScore || 0) / targetValue, 1);

    return {
      chartSize,
      center,
      radius,
      labelRadius,
      polygonPoints: buildRadarPoints(cores, radius, center, center, scale),
      scale,
    };
  }, [cores, targetValue, windowWidth]);

  useEffect(() => {
    if (!enablePointTooltip || !hasEnoughCores || !hasValidTarget) {
      setSelectedCoreId(null);
      return;
    }

    setSelectedCoreId((currentId) => {
      return currentId && cores.some((core) => core.id === currentId) ? currentId : null;
    });
  }, [cores, enablePointTooltip, hasEnoughCores, hasValidTarget]);

  const pointPositions = useMemo(
    () =>
      cores.map((core, index) => {
        const angle = (-Math.PI / 2) + (index * Math.PI * 2) / cores.length;
        const pointX = chart.center + Math.cos(angle) * chart.radius * chart.scale(core);
        const pointY = chart.center + Math.sin(angle) * chart.radius * chart.scale(core);
        const labelX = chart.center + Math.cos(angle) * chart.labelRadius;
        const labelY = chart.center + Math.sin(angle) * chart.labelRadius;

        return { core, angle, pointX, pointY, labelX, labelY };
      }),
    [chart, cores],
  );

  const selectedPoint = useMemo(
    () => pointPositions.find(({ core }) => core.id === selectedCoreId) || null,
    [pointPositions, selectedCoreId],
  );

  const resolvedSubtitle =
    subtitle ||
    `Outer ring = Average Score Target ${formatNumber(averageScoreTarget, {
      compact: compactNumbers,
    })}.`;

  return (
    <View style={[styles.card, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {resolvedSubtitle ? <Text style={styles.subtitle}>{resolvedSubtitle}</Text> : null}

      {!hasValidTarget ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Set a positive Average Score Target to scale the radar.</Text>
        </View>
      ) : !hasEnoughCores ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Add at least 3 cores to shape the radar.</Text>
          <Text style={styles.emptyText}>Your current cores still appear below and remain tappable.</Text>
        </View>
      ) : (
        <View style={styles.stage}>
          <Svg pointerEvents="none" width={chart.chartSize} height={chart.chartSize}>
            {Array.from({ length: RADAR_GRID_LEVELS }, (_, index) => {
              const ringRadius = chart.radius * ((index + 1) / RADAR_GRID_LEVELS);
              const ringPoints = buildRadarPoints(
                cores,
                ringRadius,
                chart.center,
                chart.center,
                () => 1,
              );

              return (
                <Polygon
                  key={`ring-${index + 1}`}
                  points={ringPoints}
                  fill="none"
                  stroke={RADAR_COLORS.grid}
                  strokeWidth={index + 1 === RADAR_GRID_LEVELS ? 1.6 : 1}
                />
              );
            })}

            {pointPositions.map(({ core, angle }) => {
              const axisX = chart.center + Math.cos(angle) * chart.radius;
              const axisY = chart.center + Math.sin(angle) * chart.radius;

              return (
                <Line
                  key={`axis-${core.id}`}
                  x1={chart.center}
                  y1={chart.center}
                  x2={axisX}
                  y2={axisY}
                  stroke={RADAR_COLORS.axis}
                  strokeWidth="1"
                />
              );
            })}

            <Polygon
              points={chart.polygonPoints}
              fill={RADAR_COLORS.fill}
              stroke={RADAR_COLORS.stroke}
              strokeWidth="3"
            />

            <Circle cx={chart.center} cy={chart.center} r="4" fill={RADAR_COLORS.center} />

            {pointPositions.map(({ core, pointX, pointY, labelX, labelY }) => {
              const isSelected = core.id === selectedCoreId;

              return (
                <React.Fragment key={core.id}>
                  <Circle
                    cx={pointX}
                    cy={pointY}
                    r={isSelected ? '6' : '4.5'}
                    fill={core.color || RADAR_COLORS.point}
                  />
                  <SvgText
                    x={labelX}
                    y={labelY}
                    fill={core.color || RADAR_COLORS.label}
                    fontSize="12"
                    fontWeight="700"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {shortenCoreLabel(core.name)}
                  </SvgText>
                </React.Fragment>
              );
            })}
          </Svg>

          {enablePointTooltip ? (
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setSelectedCoreId(null)}
            />
          ) : null}

          {enablePointTooltip
            ? pointPositions.map(({ core, pointX, pointY }) => (
                <Pressable
                  key={`hit-${core.id}`}
                  style={[
                    styles.pointHitTarget,
                    {
                      left: pointX - 20,
                      top: pointY - 20,
                    },
                  ]}
                  onPress={() =>
                    setSelectedCoreId((currentId) => (currentId === core.id ? null : core.id))
                  }
                />
              ))
            : null}

          {selectedPoint ? (
            <View
              style={[
                styles.tooltip,
                {
                  left: Math.max(
                    12,
                    Math.min(selectedPoint.pointX - 54, chart.chartSize - 120),
                  ),
                  top: Math.max(
                    10,
                    Math.min(selectedPoint.pointY - 56, chart.chartSize - 64),
                  ),
                },
              ]}
            >
              <View style={styles.tooltipHeader}>
                <Text style={styles.tooltipTitle}>{selectedPoint.core.name}</Text>
                <Pressable
                  hitSlop={8}
                  onPress={() => setSelectedCoreId(null)}
                  style={styles.tooltipCloseButton}
                >
                  <Text style={styles.tooltipCloseText}>x</Text>
                </Pressable>
              </View>
              <Text style={styles.tooltipValue}>
                {formatNumber(selectedPoint.core.totalScore || 0, {
                  compact: compactNumbers,
                })}{' '}
                pts
              </Text>
            </View>
          ) : null}
        </View>
      )}

      {showLegend ? (
        <View style={styles.legend}>
          {cores.map((core, index) => {
            const content = (
              <>
                <View style={[styles.legendSwatch, { backgroundColor: core.color || '#3b82f6' }]} />
                <View style={styles.legendText}>
                  <Text style={styles.legendName}>{core.name}</Text>
                  <Text style={styles.legendHint}>
                    {onPressCore ? 'Tap to manage this core' : 'Current core total score'}
                  </Text>
                </View>
                <View style={styles.legendScoreBadge}>
                  <Text style={styles.legendScore}>
                    {formatNumber(core.totalScore || 0, { compact: compactNumbers })}
                  </Text>
                </View>
              </>
            );

            const sharedStyle = [styles.legendItem, index > 0 ? styles.legendItemSpaced : null];

            if (onPressCore) {
              return (
                <TouchableOpacity
                  key={core.id}
                  style={sharedStyle}
                  onPress={() => onPressCore(core)}
                >
                  {content}
                </TouchableOpacity>
              );
            }

            return (
              <View key={core.id} style={sharedStyle}>
                {content}
              </View>
            );
          })}
        </View>
      ) : null}

      {hasValidTarget ? (
        <Text style={styles.meta}>
          Outer ring: {formatNumber(averageScoreTarget, { compact: compactNumbers })} points
          {hasCoresOverTarget ? ' · Shapes are capped at the target range' : ''}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e6eefb',
  },
  title: { fontSize: 18, fontWeight: '800', color: '#102a43' },
  subtitle: { marginTop: 6, fontSize: 13, lineHeight: 19, color: '#52637a' },
  stage: {
    marginTop: 16,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: RADAR_COLORS.panel,
    borderWidth: 1,
    borderColor: RADAR_COLORS.border,
  },
  pointHitTarget: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  emptyState: {
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#f8fbff',
    borderWidth: 1,
    borderColor: '#dbe7fb',
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#102a43' },
  emptyText: { marginTop: 6, fontSize: 13, lineHeight: 19, color: '#52637a' },
  legend: { marginTop: 14 },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f8fbff',
    borderWidth: 1,
    borderColor: '#e6eefb',
  },
  legendItemSpaced: { marginTop: 10 },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 999,
    marginRight: 12,
  },
  legendText: { flex: 1 },
  legendName: { fontSize: 15, fontWeight: '700', color: '#102a43' },
  legendHint: { marginTop: 2, fontSize: 12, color: '#7b8794' },
  legendScoreBadge: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 78,
  },
  legendScore: { fontSize: 15, fontWeight: '800', color: '#0b3d91' },
  meta: { marginTop: 14, fontSize: 12, fontWeight: '700', color: '#7b8794' },
  tooltip: {
    position: 'absolute',
    minWidth: 108,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#dbe7fb',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tooltipTitle: { fontSize: 12, fontWeight: '700', color: '#102a43' },
  tooltipValue: { marginTop: 2, fontSize: 12, fontWeight: '800', color: '#0b3d91' },
  tooltipCloseButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef4ff',
    marginLeft: 10,
  },
  tooltipCloseText: { fontSize: 13, fontWeight: '800', color: '#0b3d91' },
});
