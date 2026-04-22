import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
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
}) {
  const { width: windowWidth } = useWindowDimensions();
  const targetValue = averageScoreTarget > 0 ? averageScoreTarget : 1;
  const hasEnoughCores = cores.length >= 3;
  const hasValidTarget = averageScoreTarget > 0;
  const hasCoresOverTarget = cores.some((core) => (core.totalScore || 0) > targetValue);

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
          <Svg width={chart.chartSize} height={chart.chartSize}>
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

            {cores.map((core, index) => {
              const angle = (-Math.PI / 2) + (index * Math.PI * 2) / cores.length;
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

            {cores.map((core, index) => {
              const angle = (-Math.PI / 2) + (index * Math.PI * 2) / cores.length;
              const labelX = chart.center + Math.cos(angle) * chart.labelRadius;
              const labelY = chart.center + Math.sin(angle) * chart.labelRadius;
              const pointX = chart.center + Math.cos(angle) * chart.radius * chart.scale(core);
              const pointY = chart.center + Math.sin(angle) * chart.radius * chart.scale(core);

              return (
                <React.Fragment key={core.id}>
                  <Circle cx={pointX} cy={pointY} r="4.5" fill={RADAR_COLORS.point} />
                  <SvgText
                    x={labelX}
                    y={labelY}
                    fill={RADAR_COLORS.label}
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
    backgroundColor: RADAR_COLORS.panel,
    borderWidth: 1,
    borderColor: RADAR_COLORS.border,
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
});
