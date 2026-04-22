import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { formatNumber } from '../utils/numberFormat';

const CHART_COLORS = {
  track: '#e6eefb',
  centerBg: '#ffffff',
  title: '#102a43',
  body: '#52637a',
  accent: '#0b3d91',
  border: '#e6eefb',
  surface: '#f8fbff',
};

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180);
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function buildSlicePath(centerX, centerY, radius, startAngle, endAngle) {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    `M ${centerX} ${centerY}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

export default function CoreBalanceChart({ cores, totalScore, compactNumbers, style }) {
  const { width: windowWidth } = useWindowDimensions();
  const [selectedCoreId, setSelectedCoreId] = useState(null);

  const chart = useMemo(() => {
    const size = Math.max(220, Math.min(windowWidth - 96, 280));
    const radius = size / 2 - 16;
    const segments = [];
    let cumulativeAngle = 0;

    const normalized = [...cores]
      .map((core) => ({
        ...core,
        score: core.totalScore || 0,
        ratio: totalScore > 0 ? (core.totalScore || 0) / totalScore : 0,
      }))
      .sort((left, right) => right.score - left.score);

    normalized.forEach((core) => {
      const sliceAngle = core.ratio * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + sliceAngle;
      const midAngle = startAngle + sliceAngle / 2;
      const tooltipRadius = radius * 0.62;
      const tooltipPoint = polarToCartesian(size / 2, size / 2, tooltipRadius, midAngle);
      const selectionOffset = polarToCartesian(size / 2, size / 2, 8, midAngle);

      segments.push({
        ...core,
        isFullCircle: core.ratio >= 0.9999,
        path: buildSlicePath(size / 2, size / 2, radius, startAngle, endAngle),
        percentage: core.ratio * 100,
        tooltipX: tooltipPoint.x,
        tooltipY: tooltipPoint.y,
        offsetX: selectionOffset.x - size / 2,
        offsetY: selectionOffset.y - size / 2,
      });

      cumulativeAngle += sliceAngle;
    });

    return { size, radius, segments };
  }, [cores, totalScore, windowWidth]);

  useEffect(() => {
    setSelectedCoreId((currentId) =>
      currentId && chart.segments.some((segment) => segment.id === currentId) ? currentId : null,
    );
  }, [chart.segments]);

  const selectedSegment = chart.segments.find((segment) => segment.id === selectedCoreId) || null;
  const legendRows = useMemo(() => {
    const rows = [];

    for (let index = 0; index < chart.segments.length; index += 3) {
      rows.push(chart.segments.slice(index, index + 3));
    }

    return rows;
  }, [chart.segments]);

  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>Core Balance Portion</Text>
      <Text style={styles.subtitle}>
        100% equals the sum of all core scores, showing how your development is distributed across every core.
      </Text>

      {totalScore > 0 ? (
        <View style={styles.chartStage}>
          <View style={[styles.chartCanvas, { width: chart.size, height: chart.size }]}>
            <Svg width={chart.size} height={chart.size}>
              <Circle
                cx={chart.size / 2}
                cy={chart.size / 2}
                r={chart.radius}
                fill={CHART_COLORS.track}
              />

              {chart.segments.map((segment) => (
                segment.isFullCircle ? (
                  <Circle
                    key={segment.id}
                    cx={chart.size / 2}
                    cy={chart.size / 2}
                    r={chart.radius}
                    fill={segment.color || '#3b82f6'}
                    stroke="#ffffff"
                    strokeWidth={2}
                    onPress={() =>
                      setSelectedCoreId((currentId) => (currentId === segment.id ? null : segment.id))
                    }
                  />
                ) : (
                  <Path
                    key={segment.id}
                    d={segment.path}
                    fill={segment.color || '#3b82f6'}
                    stroke="#ffffff"
                    strokeWidth={2}
                    transform={
                      selectedCoreId === segment.id
                        ? `translate(${segment.offsetX} ${segment.offsetY})`
                        : undefined
                    }
                    onPress={() =>
                      setSelectedCoreId((currentId) => (currentId === segment.id ? null : segment.id))
                    }
                  />
                )
              ))}
            </Svg>

            {selectedSegment ? (
              <View
                style={[
                  styles.tooltip,
                  {
                    left: Math.max(8, Math.min(selectedSegment.tooltipX - 64, chart.size - 136)),
                    top: Math.max(8, Math.min(selectedSegment.tooltipY - 60, chart.size - 86)),
                  },
                ]}
              >
                <View style={styles.tooltipHeader}>
                  <Text style={styles.tooltipTitle}>{selectedSegment.name}</Text>
                  <Pressable
                    hitSlop={8}
                    onPress={() => setSelectedCoreId(null)}
                    style={styles.tooltipCloseButton}
                  >
                    <Text style={styles.tooltipCloseText}>x</Text>
                  </Pressable>
                </View>
                <Text style={styles.tooltipMetric}>{selectedSegment.percentage.toFixed(1)}%</Text>
                <Text style={styles.tooltipSubmetric}>
                  {formatNumber(selectedSegment.score, { compact: compactNumbers })} pts
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.legend}>
            {legendRows.map((row, rowIndex) => (
              <View
                key={`legend-row-${rowIndex}`}
                style={[styles.legendRow, rowIndex > 0 ? styles.legendRowSpaced : null]}
              >
                {row.map((segment) => (
                  <View
                    key={segment.id}
                    style={[styles.legendItem, { width: `${100 / row.length - (row.length > 1 ? 2 : 0)}%` }]}
                  >
                    <View style={styles.legendSwatchRow}>
                      <View
                        style={[styles.legendSwatch, { backgroundColor: segment.color || '#3b82f6' }]}
                      />
                    </View>
                    <Text style={styles.legendName} numberOfLines={2}>
                      {segment.name}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No balance data yet</Text>
          <Text style={styles.emptyText}>
            Log some score first to reveal how your development is split across cores.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: CHART_COLORS.border,
  },
  title: { fontSize: 18, fontWeight: '800', color: CHART_COLORS.title },
  subtitle: { marginTop: 6, fontSize: 13, lineHeight: 19, color: CHART_COLORS.body },
  chartStage: {
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 14,
    backgroundColor: CHART_COLORS.surface,
    borderWidth: 1,
    borderColor: '#dbe7fb',
  },
  chartCanvas: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltip: {
    position: 'absolute',
    minWidth: 128,
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
  tooltipTitle: { fontSize: 12, fontWeight: '700', color: CHART_COLORS.title, flex: 1 },
  tooltipMetric: { marginTop: 3, fontSize: 17, fontWeight: '800', color: CHART_COLORS.accent },
  tooltipSubmetric: { marginTop: 2, fontSize: 12, color: CHART_COLORS.body },
  tooltipCloseButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef4ff',
    marginLeft: 10,
  },
  tooltipCloseText: { fontSize: 13, fontWeight: '800', color: CHART_COLORS.accent },
  legend: {
    width: '100%',
    marginTop: 16,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendRowSpaced: { marginTop: 10 },
  legendItem: {
    borderRadius: 16,
    minHeight: 76,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe7fb',
  },
  legendSwatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  legendName: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: CHART_COLORS.title,
  },
  emptyState: {
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    backgroundColor: CHART_COLORS.surface,
    borderWidth: 1,
    borderColor: '#dbe7fb',
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: CHART_COLORS.title },
  emptyText: { marginTop: 6, fontSize: 13, lineHeight: 19, color: CHART_COLORS.body },
});
